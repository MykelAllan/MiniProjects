import React, {useState, useEffect} from "react";


//Hook
function useUserManagement() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState("");
  
    const addUser = (user) => {
      setUsers((prevUsers) => [...prevUsers , user]);
    }
  
    return {users, newUser, setNewUser, addUser};
    
  }

export default useUserManagement;