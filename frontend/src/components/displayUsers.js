import React from "react";

//Class component with props

function DisplayUsers({users}) {
  
    return(
  <div>
    <h1>List of Users</h1>
    {/* Condition if users length is greater than 0  
        show the user if not then show "No User To Show"
    */}
    {users.length > 0 ? 
    (
    <div>
        {users.map((user, index) => (
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

export default DisplayUsers;