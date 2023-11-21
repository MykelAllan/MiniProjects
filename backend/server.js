import express from 'express';
const app = express();
const port = 3000;
import methodOverride from 'method-override'

import mongoose from 'mongoose';

import { filterAndSortUsers } from './features/sort.mjs'


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

const uri = 'mongodb://127.0.0.1:27017/MiniProject'

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('connected to MongoDB using Mongoose'))
  .catch(err => console.log('Could not connect to MongoDB', err));


const userSchema = new mongoose.Schema({
  name: String,
  id: Number
})

const User = mongoose.model('users', userSchema)

app.get('/', (req, res) => {
  res.render('home')
});




app.get('/api/v1/users', async (req, res) => {
  try {
    const users = await User.find();
    const filteredUsers = filterAndSortUsers(users, req.query)
    res.render('user', { version: 'v1', users: filteredUsers, query: req.query })
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching users from db");
  }
});

app.post('/api/v1/users', async (req, res) => {
  const { name } = req.body;
  try {
    const maxIDUser = await User.findOne().sort({ id: -1 })
    const currentID = maxIDUser ? maxIDUser.id + 1 : 1

    const user = new User({
      name,
      id: currentID
    });

    const result = await user.save();
    console.log("saved successfully", result)
    res.redirect('/api/v1/users');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding user to db");
  }
});


app.get('/api/v2/users', async (req, res) => {
  try {
    const users = await User.find();
    const filteredUsers = filterAndSortUsers(users, req.query)
    res.render('user', { version: 'v2', users: filteredUsers, query: req.query })
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching users from db");
  }
});


app.get('/api/users/add', (req, res) => {
  res.render('userForm');
});

app.get('/api/users/update/:id', async (req, res) => {
  const userID = parseInt(req.params.id);

  try {
    const user = await User.findOne({ id: userID })

    if (user) {
      res.render('updateUser', { user })
    } else {
      res.status(404).send(`User with ID ${userID} not found`)
    }
  } catch {
    res.status(500).send(`Error fetching user ID`)
  }

})

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



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
