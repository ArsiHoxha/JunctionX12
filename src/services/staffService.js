// Staff Service for API interactions
import axios from 'axios';

const API_URL = 'https://jxaadf-backend-eb471773f003.herokuapp.com';

// Check if a user is an AADF staff member
export const isAADFStaff = async (email) => {
  try {
    const response = await axios.get(`${API_URL}/api/staff/isaadfstaff`, {
      params: { email },
      headers: {
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error checking if user is AADF staff:', error);
    return false; // Default to false if there's an error
  }
};

// Check if a user is an admin
export const isAdmin = async (email) => {
  try {
    const response = await axios.get(`${API_URL}/api/staff/isadmin`, {
      params: { email },
      headers: {
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error checking if user is admin:', error);
    return false; // Default to false if there's an error
  }
};

// Determine user role
export const getUserRole = async (email) => {
  try {
    // First check if user is admin
    const adminCheck = await isAdmin(email);
    if (adminCheck) {
      return 'admin';
    }
    
    // Then check if user is staff
    const staffCheck = await isAADFStaff(email);
    if (staffCheck) {
      return 'staff';
    }
    
    // Default role is supplier
    return 'supplier';
  } catch (error) {
    console.error('Error determining user role:', error);
    return 'supplier'; // Default role if checks fail
  }
};

export default {
  isAADFStaff,
  isAdmin,
  getUserRole
};