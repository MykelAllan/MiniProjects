import React, { useState } from 'react';

import { useUserManagement } from "./hooks/useUserManagement";

import DisplayUsers from "./components/displayUsers";


// Functional component
const App = () => {
  const {users, newUser, setNewUser, addUser} = useUserManagement();


  const addUserHandler = (e) => {
    e.preventDefault();
    addUser(newUser)
    setNewUser("");
  }
  return (
    <div>
      <h1>Add User Form</h1>
      <form onSubmit={addUserHandler}>
        <input
          type="text"
          placeholder="Insert User"
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)} 
        />
        <button type="submit" >Add User</button>

      </form>
      <DisplayUsers users={users}/>
    </div>
  );
};


export default App;
