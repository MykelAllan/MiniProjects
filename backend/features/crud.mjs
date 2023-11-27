// crud.mjs
import mongoose from 'mongoose';

const User = mongoose.model('users');

export async function updateUser(userId, updatedName) {
  try {
    const result = await User.updateOne({ id: userId }, { $set: { name: updatedName } });

    if (result.matchedCount > 0) {
      return { success: true, message: `User with ID ${userId} updated.` };
    } else {
      return { success: false, message: `User with ID ${userId} not found.` };
    }
  } catch (err) {
    console.error(err);
    return { success: false, message: `Error updating user with ID ${userId}.` };
  }
}

export async function deleteUser(userId) {
  try {
    const result = await User.deleteOne({ id: userId });

    if (result.deletedCount > 0) {
      console.log(`User with ID ${userId} deleted successfully.`);
      return { success: true, message: `User with ID ${userId} deleted successfully.` };
    } else {
      console.log(`User with ID ${userId} not found.`);
      return { success: false, message: `User with ID ${userId} not found.` };
    }
  } catch (err) {
    console.error(`Error deleting user with ID ${userId}:`, err);
    return { success: false, message: `Error deleting user with ID ${userId}.` };
  }
}
