const express = require('express');
const app = express();
const port = 3000;
const methodOverride = require('method-override');
const fs = require('fs');
const util = require('util');

app.use(express.urlencoded());
app.use(express.json());
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

app.use((req, res, next) => {
  console.log(`${req.method} request for ${req.url}`);
  next();
});

const readFileAsync = util.promisify(fs.readFile);

// Read user data from users.json file with Promises
let users = [];

async function readUsersData() {
  try {
    const data = await readFileAsync("users.json", 'utf8');
    users = JSON.parse(data);
    startServer();
  } catch (err) {
    console.error("ERROR reading the file", err);
  }
}

//error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

readUsersData();//call readUserData function

//function for filtering and sorting
function filterAndSortUser(users, query) {
  let filteredUsers = [...users]; // copy of users array
    
      //filter by name if the "name" query parameter is present
      if (query.name) {
        const searchName = query.name.toLowerCase();
        filteredUsers = filteredUsers.filter(user => user.name.toLowerCase().includes(searchName));
      }
    
      //sort the users based on query parameters
      if (query.sort === 'id') {
        filteredUsers.sort((a, b) => {
          if (query.order === 'asc') {
            return a.id - b.id;
          } else {
            return b.id - a.id;
          }
        });
      } else if (query.sort === 'name') {
        filteredUsers.sort((a, b) => {
          if (query.order === 'asc') {
            return a.name.localeCompare(b.name);
          } else {
            return b.name.localeCompare(a.name);
          }
        });
      }
      return filteredUsers;
}

//start the server after reading the file
async function startServer() {
  //homepage
  app.get('/', (req, res) => {
    res.send(`
      <button><a href="/api/v1/users">Get Users List (v1)</a></button>
      <button><a href="/api/v2/users">Get Users List (v2)</a></button>
      <button><a href="/api/users/add">Add More User</a></button>
    `);
  });
  //all users
  //version1
  app.get('/api/v1/users', (req, res) => {
    const filteredUsers = filterAndSortUser(users, req.query)
    res.render('user.ejs', {version: 'v1', users: filteredUsers, query: req.query });  
  });

  //version 2
  app.get('/api/v2/users', (req, res) => {
    const filteredUsers = filterAndSortUser(users, req.query)
    res.render('user.ejs', {version: 'v2', users: filteredUsers, query: req.query });  
  });

  app.get('/api/users/add', (req, res) => {
    res.render('userForm.ejs', { version: 'v1' });
  });

  app.get('/api/users/add/:id', (req, res) => {
    res.render('updateUserForm.ejs', { version: 'v1' });
  });

  //redirect to version 1 of api after adding new user
  app.post('/api/v1/users', (req, res) => {
    const newUser = {
      id: users.length + 1,
      name: req.body.name,
    };

    users.push(newUser);

    //write the updated user data back to users.json
    fs.writeFile('users.json', JSON.stringify(users, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Error writing to users.json:', err);
      }
    });

    res.redirect('/api/v1/users');
  });

  // Define a PUT route handler for updating a user.
  app.put('/api/users/update/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const updatedName = req.body.name;

    const user = users.find(u => u.id === userId);

    if (user) {
      user.name = updatedName;
      //Write the updated user data back to users.json
      fs.writeFile('users.json', JSON.stringify(users, null, 2), 'utf8', (err) => {
        if (err) {
          console.error('Error writing to users.json:', err);
        }
      });

      res.status(200).send(`User with ID ${userId} updated.`);
    } else {
      res.status(404).send(`User with ID ${userId} not found.`);
    }
  });

  // Define a DELETE route handler for deleting a user.
  app.delete('/api/v1/users/delete/:id', (req, res) => {
    const userId = parseInt(req.params.id);

    const index = users.findIndex(u => u.id === userId);

    if (index !== -1) {
      users.splice(index, 1);

      // Write the updated user data back to users.json
      fs.writeFile('users.json', JSON.stringify(users, null, 2), 'utf8', (err) => {
        if (err) {
          console.error('Error writing to users.json:', err);
        }
      });

      res.redirect('/api/v1/users');
    } else {
      res.status(404).send(`User with ID ${userId} not found.`);
    }
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });

}

