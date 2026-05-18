const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Suggestion = require('../models/Suggestion');
const Event = require('../models/Event');
const Book = require('../models/Book');

// @desc    Get dashboard statistics & analytics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getAdminStats = async (req, res, next) => {
  try {
    // 1. High-level metric counts
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'Pending' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'In Progress' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });
    const closedComplaints = await Complaint.countDocuments({ status: 'Closed' });

    // 2. Category distribution for pie charts
    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: '$_id',
          value: '$count',
          _id: 0,
        },
      },
    ]);

    // Ensure all standard categories exist in the list (fill 0 if empty)
    const standardCategories = [
      'WiFi',
      'Electricity',
      'Water Leakage',
      'Cleanliness',
      'Hostel',
      'Ragging',
      'Lab Equipment',
      'Classroom',
      'Canteen',
      'Other',
    ];

    const categoryData = standardCategories.map((cat) => {
      const found = categoryStats.find((item) => item.name === cat);
      return {
        name: cat,
        value: found ? found.value : 0,
      };
    });

    // 3. Trends timeline (complaints in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyStats = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Fill missing days with zero
    const timelineData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];

      // Format date label for chart (e.g. "May 18")
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayMatch = dailyStats.find((item) => item._id === dateString);
      timelineData.push({
        date: label,
        complaints: dayMatch ? dayMatch.count : 0,
      });
    }

    // 4. Recent activity (last 5 complaints updated or created)
    const recentActivity = await Complaint.find()
      .populate('studentId', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(5);

    // 5. Total counts of users & operational entities
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    const totalAlumni = await User.countDocuments({ role: 'alumni' });
    const totalSuggestions = await Suggestion.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalBooks = await Book.countDocuments();

    res.json({
      success: true,
      stats: {
        totalComplaints,
        pendingComplaints,
        inProgressComplaints,
        resolvedComplaints,
        closedComplaints,
        totalUsers,
        totalStudents,
        totalFaculty,
        totalAlumni,
        totalSuggestions,
        totalEvents,
        totalBooks,
      },
      categoryData,
      timelineData,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// USER CONTROLS (BAN/UNBAN, CHANGE ROLE)
// ==========================================

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle suspension / ban status of user
// @route   PUT /api/admin/users/:id/ban
// @access  Private (Admin only)
const toggleUserBan = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User account not found');
    }

    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Administrators cannot ban other administrators.');
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      success: true,
      message: `User "${user.name}" has been successfully ${user.isBanned ? 'suspended' : 're-activated'}.`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user authority role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role || !['student', 'faculty', 'alumni', 'admin'].includes(role)) {
      res.status(400);
      throw new Error('Invalid user role specified');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User account not found');
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User "${user.name}" role updated to ${role}.`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// SUGGESTION MODERATION
// ==========================================

// @desc    Moderate a suggestion status
// @route   PUT /api/admin/suggestions/:id
// @access  Private (Admin only)
const moderateSuggestion = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status || !['Under Review', 'Approved', 'Implemented', 'Spam'].includes(status)) {
      res.status(400);
      throw new Error('Invalid suggestion status specified');
    }

    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      res.status(404);
      throw new Error('Suggestion not found');
    }

    suggestion.status = status;
    await suggestion.save();

    res.json({
      success: true,
      message: `Suggestion status updated to: ${status}.`,
      data: suggestion,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  toggleUserBan,
  changeUserRole,
  moderateSuggestion,
};
