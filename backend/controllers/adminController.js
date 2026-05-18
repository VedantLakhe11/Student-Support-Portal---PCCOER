const Complaint = require('../models/Complaint');
const User = require('../models/User');

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
      'Electricity',
      'Water Leakage',
      'Wi-Fi',
      'Cleanliness',
      'Hostel',
      'Lab Equipment',
      'Classroom Issue',
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

    // 5. Total counts of users
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });

    res.json({
      success: true,
      stats: {
        totalComplaints,
        pendingComplaints,
        inProgressComplaints,
        resolvedComplaints,
        totalUsers,
        totalStudents,
      },
      categoryData,
      timelineData,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
};
