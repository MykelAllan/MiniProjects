import React from "react";

//Class component with props

function DisplayUsers({ users, deleteUser, setUsers }) {

  const toggleDelete = (index) => {
    const deletedUser = [...users];
    deletedUser[index] = { ...deletedUser[index], deleted: !deletedUser[index].deleted }
    setUsers(deletedUser);

    // deleteUser(index);//Deletes the User
  }
  return (
    <div>
      <h1>List of Users</h1>
      {/* Condition if users length is greater than 0  
        show the user if not then show "No User To Show"
    */}
      {users.length > 0 ?
        (
          <div className="user-list">
            {users.map((user, index) => (
              <li className="user-list-item"
                key={index}
                style={{
                  textDecoration: user.deleted ? 'line-through' : 'none',
                  color: user.deleted ? "red" : "initial"
                }}>
                {user.name}
                <button onClick={() => toggleDelete(index)}>
                  {user.deleted ? 'Undo' : 'Delete'}
                </button>
              </li>
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

export default DisplayUsers;