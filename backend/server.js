
const express = require('express')
const app = express();
const port = 3000;
const methodOverride = require('method-override')

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert')
const uri = "mongodb://localhost:27017"
const dbName = "MiniProject"

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

let db;

(async function () {
  try {
    const client = await MongoClient.connect("mongodb://localhost:27017");
    console.log("Connected to MongoDB");
    db = client.db("MiniProject");

  } catch (err) {
    console.log("MongoDB ERROR: ", err);
  }
})();

app.get('/', (req, res) => {
  res.send(`
    <button><a href="/api/v1/users">Get Users List (v1)</a></button>
    <button><a href="/api/v2/users">Get Users List (v2)</a></button>
    <button><a href="/api/users/add">Add More User</a></button>
  `);
});

app.get('/api/v1/users', async (req, res) => {
  try {
    const users = await db.collection('users').find({}).toArray();
    res.json({ version: 'v1', users, query: req.query });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching users from db");
  }
});

app.get('/api/v2/users', async (req, res) => {
  try {
    const users = await db.collection('users').find({}).toArray();
    res.json({ version: 'v2', users, query: req.query });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching users from db");
  }
});

app.get('/api/users/add', (req, res) => {
  res.send("Add user form");
});

app.post('/api/v1/users', async (req, res) => {
  const newUser = {
    id: parseInt(req.body.id),
    name: req.body.name,
  };

  try {
    await db.collection('users').insertOne(newUser);
    res.redirect('/api/v1/users');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding user to db");
  }
});

app.put('/api/users/update/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  const updatedName = req.body.name;

  try {
    await db.collection('users').updateOne({ id: userId }, { $set: { name: updatedName } });
    res.status(200).send(`User with ID ${userId} updated.`);
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error updating user with ID ${userId}.`);
  }
});

app.delete('/api/v1/users/delete/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    await db.collection('users').deleteOne({ id: userId });
    res.redirect('/api/v1/users');
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error deleting user with ID ${userId}.`);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});