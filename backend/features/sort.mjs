// sort.mjs
export function sortUsers(users, sortBy, sortOrder) {
  return users.sort((a, b) => {
    if (sortBy === 'id') {
      return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
    } else if (sortBy === 'name') {
      return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    } else {
      return 0; // No sorting if sortBy is not recognized
    }
  });
}

export function filterAndSortUsers(users, query) {
  let filteredUsers = [...users]; // Make a copy of the users array

  // Filter users by name if the "name" query parameter is present
  if (query.name) {
    const searchName = query.name.toLowerCase();
    filteredUsers = filteredUsers.filter(user => user.name.toLowerCase().includes(searchName));
  }

  // Sort the users based on query parameters
  if (query.sort && query.order) {
    filteredUsers = sortUsers(filteredUsers, query.sort, query.order);
  }

  return filteredUsers;
}
