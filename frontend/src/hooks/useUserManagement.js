import { useState } from "react";


//Hook userManagement
export const useUserManagement = (initialUsers = []) => {
  const [users, setUsers] = useState(initialUsers);
  const [newUser, setNewUser] = useState("");

  const addUser = (user) => {
    if (user !== "") {
      const userObj = { name: user, deleted: false };
      setUsers([...users, userObj]);
    } else {
      console.log("no user input")
    }
  }
  const deleteUser = (index) => {
    const updatedUser = [...users];
    updatedUser.splice(index, 1)
    setUsers(updatedUser);
  }

  return { users, newUser, setNewUser, addUser, setUsers, deleteUser };

}
