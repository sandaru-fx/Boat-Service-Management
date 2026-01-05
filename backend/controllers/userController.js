import User from '../models/userModel.js';
import BoatRepair from '../models/boatRepairModel.js';
import jwt from 'jsonwebtoken';

// register a new user
const registerUser = async(req,res)=>{
  try{

    const {
      name,
      email,
      nic,
      password,
      passwordConfirm,
      phone,
      address,
      role,
      // Employee specific fields
      employeeId,
      position,
      dateOfBirth,
      emergencyContact
    } = req.body;

    console.log('Creating user with role:', role);
    console.log('Email:', email);

    const existingUser = await User.findOne({email});
    if(existingUser){

      // Fix existing employee if they don't have employeeData
      if (role === 'employee' && existingUser.role === 'employee') {
        if (!existingUser.employeeData?.employeeId) {
          // Find the highest existing employee ID and increment it
          const existingEmployees = await User.find({ 
            role: 'employee', 
            'employeeData.employeeId': { $exists: true, $ne: null, $ne: '' }
          });
          
          let maxId = 0;
          existingEmployees.forEach(emp => {
            const empId = emp.employeeData?.employeeId;
            if (empId && empId.startsWith('EMP')) {
              const num = parseInt(empId.substring(3));
              if (!isNaN(num)) {
                maxId = Math.max(maxId, num);
              }
            }
          });
          
          const newEmployeeId = `EMP${String(maxId + 1).padStart(3, '0')}`;
          console.log(`Generated new employee ID for existing user: ${newEmployeeId}`);
          
          existingUser.employeeData = {
            employeeId: newEmployeeId,
            position,
            hireDate: existingUser.createdAt || new Date(),
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            emergencyContact: {
              name: emergencyContact?.name,
              phone: emergencyContact?.phone,
              relationship: emergencyContact?.relationship
            }
          };
          await existingUser.save();
          console.log('Fixed existing employee data for:', existingUser.name);
        }
      }
      
      return res.status(400).json({error: 'User with this email already exists'});
    }

    // Build user data object
    const userData = {
      name, 
      email, 
      nic, 
      password, 
      passwordConfirm, 
      phone, 
      address, 
      role: role || 'customer'
    };

    // Add employee data if role is employee
    if (role === 'employee') {
      // Auto-generate employee ID if not provided
      let finalEmployeeId = employeeId;
      
      if (!finalEmployeeId) {
        // Find the highest existing employee ID and increment it
        const existingEmployees = await User.find({ 
          role: 'employee', 
          'employeeData.employeeId': { $exists: true, $ne: null, $ne: '' }
        });
        
        let maxId = 0;
        existingEmployees.forEach(emp => {
          const empId = emp.employeeData?.employeeId;
          if (empId && empId.startsWith('EMP')) {
            const num = parseInt(empId.substring(3));
            if (!isNaN(num)) {
              maxId = Math.max(maxId, num);
            }
          }
        });
        
        finalEmployeeId = `EMP${String(maxId + 1).padStart(3, '0')}`;
        console.log(`Generated new employee ID: ${finalEmployeeId}`);
      } else {
        // Check for duplicate employee ID if manually provided
        const existingEmployee = await User.findOne({'employeeData.employeeId': finalEmployeeId});
        if (existingEmployee) {
          return res.status(400).json({error: 'Employee ID already exists'});
        }
      }

      userData.employeeData = {
        employeeId: finalEmployeeId,
        position,
        hireDate: new Date(), // Set hire date when creating employee
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        emergencyContact: {
          name: emergencyContact?.name,
          phone: emergencyContact?.phone,
          relationship: emergencyContact?.relationship
        }
      };
    }

    console.log('User data before creation:', JSON.stringify(userData, null, 2));
    
    const newUser = await User.create(userData);
    
    console.log('User created successfully:', newUser.email, 'Role:', newUser.role);
    
    const token = jwt.sign(
      {id: newUser._id, role: newUser.role, email: newUser.email, name: newUser.name},
      process.env.JWT_SECRET,
      {expiresIn: process.env.JWT_EXPIRES_IN}
    );

    // remove password from response
    newUser.password = undefined;

    // send success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser,
        token 
      }
    })

  }catch(error){
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message
    })
  }
};

// Get all users (for debugging) - no auth required
const getAllUsersDebug = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    console.log('Total users in database:', users.length);
    console.log('Users by role:');
    const roleCount = {};
    users.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
      console.log(`- ${user.email} (${user.role})`);
    });
    console.log('Role distribution:', roleCount);
    
    res.status(200).json({
      success: true,
      count: users.length,
      users: users,
      roleDistribution: roleCount
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// login a user - original version //////////////////////////////////////////////////////////////
// const loginUser = async(req,res)=>{
//   try{
//   const {email, password} = req.body;

//   const user = await User.findOne({email}).select('+password');

//   if(!user){
//     return res.status(401).json({
//       success: false,
//       message: 'Invalid email or password'
//     });
//   }

//   const isPasswordCorrect = await user.correctPassword(password, user.password);
//   if(!isPasswordCorrect){
//     return res.status(401).json({
//       success: false,
//       message: 'Invalid email or password'
//     })
//   }

//   // generate JWT token

//   const token = jwt.sign(
//     {id: user._id, role: user.role },
//     process.env.JWT_SECRET,
//     {expiresIn: process.env.JWT_EXPIRES_IN}
//   );
  
//   // remove password from response
//   user.password = undefined;

//   // send success response
//   res.status(200).json({
//     success: true,
//     message: 'Login successful',
//     data: {
//       user,
//       token
//     },
//   })
// }catch(error){
//   console.error('Login error:', error);
//   res.status(500).json({
//     success: false,
//     message: 'Login failed',
//     error: error.message
//   });
// }
// };


// login a user - new version //////////////////////////////////////////////////////////////////
const loginUser = async(req,res)=>{
  try{
    console.log('Login request received', req.body);

    const {email, password} = req.body;
console.log('email: ', email);


  const user = await User.findOne({email}).select('+password');
  console.log("user found? : ", user ? 'yes': 'no');

  if(!user){
    console.log('user not found with email: ', email)
    return res.status(401).json({success: false,
      message: 'Invalid email or password',
      error: 'User not found'
    });
  }

  const isPasswordCorrect = await user.correctPassword(password, user.password);
  if(!isPasswordCorrect){
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    })
  }

  // generate JWT token

  const token = jwt.sign(
    {id: user._id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    {expiresIn: process.env.JWT_EXPIRES_IN}
  );
  
  // remove password from response
  user.password = undefined;

  // send success response
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      token
    },
  })
}catch(error){
  console.error('Login error:', error);
  res.status(500).json({
    success: false,
    message: 'Login failed',
    error: error.message
  });
}
};


// update user
const updateProfile = async(req,res)=>{
  try{

    // extract user id from JWT token
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // find user
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // define what the user cannot update
    let restrictedFields;

    // base restricted fields (for everyone)
    const baseRestricted = [  'email', 'nic', 'role', 'password'];

    // role specific restrictions
    if(user.role ==='customer'){
      restrictedFields = [...baseRestricted, 'employeeData', 'adminData'];
    }else if(user.role === 'employee'){
      restrictedFields = [...baseRestricted, 'adminData'];
    }else if(user.role === 'admin'){
      restrictedFields = baseRestricted;
    }


    // remove restricted fields from req.body
    const updateData = {...req.body};
    restrictedFields.forEach(field => {
      delete updateData[field];
    });

    // if no valid fields to update
    if(Object.keys(updateData).length === 0){
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      })
    }

    // update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      {new: true, runValidators: true}
    );


    updatedUser.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {user: updatedUser}    
    })


}catch(error){

  console.error('Profile update error: ', error);
  res.status(500).json({
    success: false,
    message: 'Profile update failed',
    error: error.message
  })
}

}


// update password
const updatePassword = async(req,res)=>{
  try{

    // extract user id from JWT token (similar to updateProfile method)
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId= decoded.id;
    
    // check if user exists
    const user = await User.findById(userId).select('+password');

    if(!user){
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: error.message
      })
    }
    
    // get all form data (old password, new password, new password confirm)
    const {currentPassword, newPassword, newPasswordConfirm} = req.body;

    // check if old password is correct
    const isCurrentPasswordCorrect  = await user.correctPassword(currentPassword, user.password);
    if(!isCurrentPasswordCorrect){
      return res.status(401).json({
        success: flase,
        message: 'Current password is incorrect',
        error : error.message
      })
    }

    if(newPassword !== newPasswordConfirm){
      return res.status(400).json({
        success: false,
        message: 'New password and new password confirm do not match',
        error : error.message
      })
    }

    // update password
    user.password = newPassword;
    user.passwordConfirm = confirmPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    })

  }catch(error){
    console.error('Password update error:', error);
    res.status(500).json({
      success: false,
      message: 'Password update failed',
      error: error.message
    })
  }
}


// get user profile
const getUserProfile = async(req,res)=>{
  try{

//  extract user id from auth middleware - using request object
    const userId = req.user.id;
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // remove password from response
    user.password = undefined;

    // send the user profile data to the client/ whoever requested it
    res.status(200).json({
      success: true,
      message: 'User profile fetched successfully',
      data: {user: user}
    })
  }catch(error){
    console.error('User profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'User profile fetch failed'
    })

  }

}


// get user by id
const getUserById = async(req, res) =>{
  try{
    if(req.user.role !== 'admin'){
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this resource'
      });
    }

    const userId = req.params.id;
    const user = await User.findById(userId).select('+password');

    if(!user){
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // For admin access, include password (but don't send it to non-admin users)
    // Note: Password is hashed, so it's safe to show to admin
    // user.password = undefined; // Commented out for admin access

    res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      data: {user: user}
    });

  }catch(error){
    console.error('User fetch by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'User fetch by ID failed',
      error: error.message
    })
  }
}

//  get all users (admin only)
const getAllUsers = async(req, res) =>{
  try{
    // check if user is admin
    if(req.user.role !== 'admin'){
      return res.status(403).json({ 
        success: false,
        message: 'You are not authorized to access this resource'
      })
    }
    // get all users from db - use find() method
    const users = await User.find();

    // if no users found
    if(users.length === 0){
      return res.status(404).json({
        success: false,
        message: 'No users found'
      })
    }

    // initialize arrays for each role (for grouping users by role)
    let customers =[];
    let employees =[];
    let admins =[];

    // remove password from response and categorize users by role
    users.forEach(user => {
      user.password = undefined;

      // categorize users based on their role and add to the appropriate array
      switch(user.role){
        case 'customer':
          customers.push(user);
          break;
        case 'employee':
          employees.push(user);
          break;
        case 'admin':
          admins.push(user);
          break;
        default:
          break;
      }
    });

    // send the users data to the client/ whoever requested it
    res.status(200).json({
      success: true,
      message: 'All users fetched successfully',
      data: {customers, employees, admins}
    })

  }catch(error){
    console.error('All users fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'All users fetch failed'
    })
  }
}


// delete user (role specific)
const deleteUser = async(req, res) =>{
  try{
    // get who's making the request
    const deleter = req.user;
    
    // get who they want to delete
    const targetUserId = req.params.id; // or req.body.userId

    // find the target user
    const targetUser = await User.findById(targetUserId);

    if(!targetUser){
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // see if they have permission to delete the user and only allow relevant roles to delete specific users
    if(deleter.role === 'customer'){
      if(deleter.id != targetUserId){
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this user'
        })
      }
    }else if(deleter.role === 'employee'){
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete users'
      })
    }else if(deleter.role === 'admin'){
      if(deleter.id === targetUserId){
        return res.status(403).json({
          success: false,
          message: 'You cannot delete your own admin account'
        })
      }
    }

    // proceed with deletion
    await User.findByIdAndDelete(targetUserId);
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    })

  }catch(error){
    console.error('User deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'User deletion failed',
      error: error.message
    })
  }
}

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData.passwordConfirm;
    delete updateData._id;
    delete updateData.createdAt;

    // Find and update user
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({
      success: false,
      message: 'User update failed',
      error: error.message
    });
  }
};

// search users
const searchUsers = async(req, res) =>{
  try{
    const {
      query, 
      role, 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      search
    } = req.query;
    
    let searchCriteria = {};

    // Use 'search' parameter if provided, otherwise use 'query'
    const searchTerm = search || query;
    
    // search by name or email
    if(searchTerm){
      searchCriteria.$or = [
        {name: {$regex: searchTerm, $options: 'i'}}, // case insensitive search
        {email: {$regex: searchTerm, $options: 'i'}},
        {phone: {$regex: searchTerm, $options: 'i'}},
        {nic: {$regex: searchTerm, $options: 'i'}}
      ];
    }

    // filter by role
    if(role){
      searchCriteria.role = role;
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count for pagination
    const total = await User.countDocuments(searchCriteria);
    const totalPages = Math.ceil(total / limitNum);

    // Get users with pagination and sorting
    const users = await User.find(searchCriteria)
      .select('-password') // exclude password from response
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      message: 'Users found successfully',
      users,
      total,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      query: searchTerm || '',
      role: role || 'all'
    });
  }catch(error){
    console.error('User search error:', error);
    res.status(500).json({
      success: false,
      message: 'User search failed',
      error: error.message
    });
  }
}


// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats...');
    
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const totalRepairs = await BoatRepair.countDocuments();
    
    // Calculate total revenue from completed boat repairs
    const revenueResult = await BoatRepair.aggregate([
      { $match: { status: 'completed', totalCost: { $exists: true, $ne: null } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalCost' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Get total number of products (spare parts)
    const Product = (await import('../models/productModel.js')).default;
    const totalProducts = await Product.countDocuments();
    
    // Get total boat rides
    const BoatRide = (await import('../models/boatRideModel.js')).default;
    const totalRides = await BoatRide.countDocuments();
    
    // Get total sales visits (appointments)
    const AppointmentBooking = (await import('../models/appointmentBooking.model.js')).default;
    const totalSalesVisits = await AppointmentBooking.countDocuments();
    
    // Get total spare part sales (orders)
    const Order = (await import('../models/Order.js')).default;
    const totalSparePartSales = await Order.countDocuments();
    
    const stats = {
      totalUsers,
      totalCustomers,
      totalEmployees,
      totalRides,
      totalRepairs,
      totalRevenue,
      totalProducts,
      totalSalesVisits,
      totalSparePartSales
    };
    
    console.log('📊 Dashboard stats:', stats);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Failed to get dashboard stats' });
  }
};

// Block user
const blockUser = async (req, res) => {
  try {
    if (req.user.role !== 'employee' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only employees and admins can block users'
      });
    }

    const userId = req.params.userId;
    // Try to find user by email first, then by ID
    const user = await User.findOne({ email: userId }) || await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isBlocked = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User blocked successfully',
      data: { userId: user._id, isBlocked: user.isBlocked }
    });

  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block user',
      error: error.message
    });
  }
};

// Unblock user
const unblockUser = async (req, res) => {
  try {
    if (req.user.role !== 'employee' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only employees and admins can unblock users'
      });
    }

    const userId = req.params.userId;
    // Try to find user by email first, then by ID
    const user = await User.findOne({ email: userId }) || await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isBlocked = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully',
      data: { userId: user._id, isBlocked: user.isBlocked }
    });

  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock user',
      error: error.message
    });
  }
};

export {registerUser, loginUser, updateProfile, updatePassword, getUserProfile, getAllUsers, getAllUsersDebug, deleteUser, updateUser, searchUsers, getUserById, getDashboardStats, blockUser, unblockUser}
