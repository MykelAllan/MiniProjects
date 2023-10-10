import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Functional component
const App = () => {
  const [users, setUsers] = useState([]); // State for users

  // Fetch users from API
  useEffect(() => {
    axios.get('<http://localhost:3000/api/users>')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  // Event handler for refreshing users
  const handleRefresh = () => {
    // Fetch users again
    axios.get('<http://localhost:3000/api/users>')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  return (
    <div>
      <h1>User List</h1>
      <button onClick={handleRefresh}>Refresh</button>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
