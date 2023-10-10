import React, { useState } from 'react';

// Functional component
const App = () => {
  const [users, setUsers] = useState([]); // State for users
  const [newUser, setNewUser] = useState("");

  const addUserHandler = (e) => {
    e.preventDefault();
    setUsers([...users, newUser]);
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

//Class component with props
function DisplayUsers(props) {
  return(
<div>
  <h1>List of Users</h1>
  {/* Condition if users length is greater than 0  
      show the user if not then show "No User To Show"
  */}
  {props.users.length > 0 ? 
  (
  <div>
      {props.users.map((user, index) => (
        <li key={index}>{user}</li>
      ))}
    </div>
  ) : 
  (
    <div>
      <h4>No Users to Show</h4>
      </div>
  )}
</div>
  );
}

export default App;
