const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');

// @desc    Register a new student/faculty/alumni
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role: requestedRole, prn, dept, year } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please enter all fields');
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    // Smart role director
    let role = requestedRole || 'student';
    if (email.startsWith('admin@') || email === 'admin@college.edu') {
      role = 'admin';
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      prn: prn || '',
      dept: dept || 'Computer Engineering',
      year: year || 'FE',
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          prn: user.prn,
          dept: user.dept,
          year: user.year,
          avatar: user.avatar,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data received');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials. User not found.');
    }

    // Check if user is suspended/banned
    if (user.isBanned) {
      res.status(403);
      throw new Error('This account has been suspended by the campus administrator.');
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials. Password incorrect.');
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        prn: user.prn,
        dept: user.dept,
        year: user.year,
        avatar: user.avatar,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          prn: user.prn,
          dept: user.dept,
          year: user.year,
          avatar: user.avatar,
        },
      });
    } else {
      res.status(404);
      throw new Error('User profile not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error('Please enter your email');
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error('User not found with that email');
    }

    // Generate reset token (simple code for user demo ease)
    const resetToken = crypto.randomBytes(3).toString('hex').toUpperCase(); // E.g., 'A8B4F9'
    
    user.forgotPasswordToken = resetToken;
    user.forgotPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins expiry
    await user.save();

    res.json({
      success: true,
      message: 'Password reset code generated successfully.',
      resetCode: resetToken, // Returned in API for easy demo without email transport
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      res.status(400);
      throw new Error('Please fill in all reset values');
    }

    const user = await User.findOne({
      email,
      forgotPasswordToken: code,
      forgotPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired password reset code.');
    }

    // Set new password
    user.password = newPassword;
    user.forgotPasswordToken = null;
    user.forgotPasswordExpire = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new credentials.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update User Profile Settings
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.name = req.body.name || user.name;
    user.prn = req.body.prn || user.prn;
    user.dept = req.body.dept || user.dept;
    user.year = req.body.year || user.year;
    user.avatar = req.body.avatar || user.avatar;

    if (req.body.password) {
      if (req.body.password.length < 6) {
        res.status(400);
        throw new Error('New password must be at least 6 characters');
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        prn: updatedUser.prn,
        dept: updatedUser.dept,
        year: updatedUser.year,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
  updateUserProfile,
};
