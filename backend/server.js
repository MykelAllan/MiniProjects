import express from 'express';
import methodOverride from 'method-override';
import mongoose from 'mongoose';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

import { filterAndSortUsers } from './features/sort.mjs';

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

// Session setup
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
const uri = 'mongodb://127.0.0.1:27017/MiniProject';
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB using Mongoose'))
  .catch(err => console.log('Could not connect to MongoDB', err));

// Passport local strategy
passport.use(new LocalStrategy(
  async (username, password, done) => {
    const userLogin = await UserLogin.findOne({ username: username });
    if (!userLogin || !bcrypt.compareSync(password, userLogin.password)) {
      console.log("Incorrect password and username");
      return done(null, false, { message: 'Incorrect username or password.' });
    }
    console.log("Correct password and username");
    return done(null, userLogin);
  }
));

// Passport serialization and deserialization
passport.serializeUser((userLogin, done) => {
  done(null, userLogin.id);
});

passport.deserializeUser((id, done) => {
  UserLogin.findById(id).then(user => {
    done(null, user);
  }).catch(err => {
    done(err);
  });
});

// Function to ensure user is authenticated
const ensureAuthenticated = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Invalid token
      return res.redirect('/login');
    }
    req.user = user;
    next();
  });
};

// Function to verify token
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.sendStatus(401); // No Token, unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next();
  });
};


// MongoDB Schemas
const userLoginSchema = new mongoose.Schema({
  username: String,
  password: String
});
const UserLogin = mongoose.model('UserLogins', userLoginSchema);

const userSchema = new mongoose.Schema({
  name: String,
  id: Number
});
const User = mongoose.model('users', userSchema);

// Routes
app.get('/', (req, res) => {
  res.render('home', { user: req.user });
});

// Registration
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const newUserLogin = new UserLogin({ username: req.body.username, password: hashedPassword });
    await newUserLogin.save();
    res.redirect('/login');
  } catch (error) {
    console.log(error);
    res.redirect('/register');
  }
});

// Login
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err); // Log the error for debugging
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: 'Incorrect username or password.' });
    }
    req.login(user, (err) => {
      if (err) {
        console.error(err); // Log the error for debugging
        return next(err);
      }
      try {
        const token = jwt.sign({ id: user._id, user: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/');
      } catch (tokenError) {
        console.error(tokenError); // Log the error for debugging
        return next(tokenError);
      }
    });
  })(req, res, next);
});

// Logout
app.get('/logout', (req, res) => {
  req.logout(function (err) {
    if (err) {
      console.error(err); // Log the error for debugging
      return next(err);
    }
    res.cookie('token', process.env.JWT_SECRET, { expires: new Date(0), httpOnly: true });
    res.redirect('/');
  });
});

// User Routes
app.get('/api/v1/users', verifyToken, async (req, res) => {
  try {
    const users = await User.find();
    const filteredUsers = filterAndSortUsers(users, req.query);
    res.render('user', { version: 'v1', users: filteredUsers, query: req.query });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching users from db");
  }
});

app.post('/api/v1/users', async (req, res) => {
  const { name } = req.body;
  try {
    const maxIDUser = await User.findOne().sort({ id: -1 });
    const currentID = maxIDUser ? maxIDUser.id + 1 : 1;
    const user = new User({
      name,
      id: currentID
    });
    const result = await user.save();
    console.log("Saved successfully", result);
    res.redirect('/api/v1/users');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding user to db");
  }
});

app.get('/api/v2/users', verifyToken, async (req, res) => {
  try {
    const users = await User.find();
    const filteredUsers = filterAndSortUsers(users, req.query);
    res.render('user', { version: 'v2', users: filteredUsers, query: req.query });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching users from db");
  }
});

app.get('/api/users/add', ensureAuthenticated, (req, res) => {
  res.render('userForm');
});

app.get('/api/users/update/:id', async (req, res) => {
  const userID = parseInt(req.params.id);
  try {
    const user = await User.findOne({ id: userID });
    if (user) {
      res.render('updateUser', { user });
    } else {
      res.status(404).send(`User with ID ${userID} not found`);
    }
  } catch {
    res.status(500).send(`Error fetching user ID`);
  }
});

app.post('/api/users/update/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  const updatedName = req.body.updatedName;
  try {
    const result = await User.updateOne({ id: userId }, { $set: { name: updatedName } });
    if (result.matchedCount > 0) {
      res.redirect('/api/v1/users');
    } else {
      res.status(404).send(`User with ID ${userId} not found`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error updating user with ID ${userId}`);
  }
});

app.delete('/api/v1/users/delete/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const result = await User.deleteOne({ id: userId });
    if (result.deletedCount > 0) {
      console.log(`User with ID ${userId} deleted successfully.`);
      res.redirect('/api/v1/users');
    } else {
      console.log(`User with ID ${userId} not found.`);
      res.status(404).send(`User with ID ${userId} not found.`);
    }
  } catch (err) {
    console.error(`Error deleting user with ID ${userId}:`, err);
    res.status(500).send(`Error deleting user with ID ${userId}.`);
  }
});

// Server setup
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
