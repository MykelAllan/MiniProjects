import React, { useEffect } from 'react';

import { useUserManagement } from "./hooks/useUserManagement";

import DisplayUsers from "./components/displayUsers";


// Functional component
const App = () => {
  const { users, newUser, setNewUser, addUser, setUsers, deleteUser } = useUserManagement();

  const addUserHandler = (e) => {
    e.preventDefault();
    addUser(newUser);
    setNewUser("");
  }

  const inputHandler = (e) => {
    const inputVal = e.target.value;
    if (inputVal.length <= 8) {
      setNewUser(inputVal);
    } else {
      console.log("max limit hit")
    }
  }

  useEffect(()=> {
    document.title = `Users: ${users.length}`
  })

  return (
    <div className='container'>
      <h1>Add User Form</h1>
      <form className="user-form" onSubmit={addUserHandler}>
        <input
          className="user-input"
          type="text"
          placeholder="Insert User (Max 8 Characters)"
          value={newUser}
          onChange={inputHandler}
        />
        <button className="user-button" type="submit" >Add User</button>

      </form>
      <DisplayUsers users={users} addUser={addUser} setUsers={setUsers} deleteUser={deleteUser} />
    </div>
  );
};

export default App;
