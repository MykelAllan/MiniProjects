const express = require('express');
const app = express();
const port = 3000;
const methodOverride = require('method-override');
const fs = require('fs'); // Add the 'fs' module to read the users.json file

app.use(express.urlencoded());
app.use(express.json());
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

app.use((req, res, next) => {
  console.log(`${req.method} request for ${req.url}`);
  next();
});

// Read user data from users.json
let users = [];
fs.readFile('users.json', 'utf8', (err, data) => {
  if (!err) {
    users = JSON.parse(data);
  }
});

app.get('/', (req, res) => {
  res.send(`
    <button><a href="/api/v1/users">Get Users List</a></button>
    <button><a href="/api/v2/users">Get Users List (v2)</a></button>
    <button><a href="/api/users/add">Add More User</a></button>
  `);
});

app.get('/api/v1/users', (req, res) => {
    let filteredUsers = [...users]; // Create a copy of the users array
  
    // Filter by name if the "name" query parameter is present
    if (req.query.name) {
      const searchName = req.query.name.toLowerCase();
      filteredUsers = filteredUsers.filter(user => user.name.toLowerCase().includes(searchName));
    }
  
    // Sort the users based on query parameters
    if (req.query.sort === 'id') {
      filteredUsers.sort((a, b) => {
        if (req.query.order === 'asc') {
          return a.id - b.id;
        } else {
          return b.id - a.id;
        }
      });
    } else if (req.query.sort === 'name') {
      filteredUsers.sort((a, b) => {
        if (req.query.order === 'asc') {
          return a.name.localeCompare(b.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      });
    }
  
    res.render('user.ejs', {version: 'v1', users: filteredUsers, query: req.query });
  });

app.get('/api/v1/users/add', (req, res) => {
  res.render('userForm.ejs', { version: 'v1' });
});

app.get('/api/v1/users/add/:id', (req, res) => {
  res.render('updateUserForm.ejs', { version: 'v1' });
});

app.post('/api/v1/users', (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name,
  };

  users.push(newUser);

  // Write the updated user data back to users.json
  fs.writeFile('users.json', JSON.stringify(users, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing to users.json:', err);
    }
  });

  res.redirect('/api/v1/users');
});

//version 2
app.get('/api/v2/users', (req, res) => {
    res.render('user.ejs', { users, version: 'v2' });
  });
  
  app.get('/api/v2/users/add', (req, res) => {
    res.render('userForm.ejs', { version: 'v2' });
  });
  
  app.post('/api/v2/users', (req, res) => {
    const newUser = {
      id: users.length + 1,
      name: req.body.name,
    };
  
    users.push(newUser);
  
    // Write the updated user data back to users.json
    fs.writeFile('users.json', JSON.stringify(users, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Error writing to users.json:', err);
      }
    });
  
    res.redirect('/api/v2/users');
  });

// Define a PUT route handler for updating a user.
app.put('/api/v1/users/update/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const updatedName = req.body.name;

  const user = users.find(u => u.id === userId);

  if (user) {
    user.name = updatedName;
    // Write the updated user data back to users.json
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
