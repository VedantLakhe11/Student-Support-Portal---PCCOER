const Complaint = require('../models/Complaint');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Student only)
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      res.status(400);
      throw new Error('Please enter title, description and category');
    }

    // Role check (Only students should log tickets)
    if (req.user.role !== 'student') {
      res.status(403);
      throw new Error('Admins cannot register complaints. Please use a student account.');
    }

    // Image capture
    let imagePath = '';
    if (req.file) {
      // Store relative path so frontend can fetch it as static resource
      imagePath = `/uploads/${req.file.filename}`;
    }

    const complaint = await Complaint.create({
      studentId: req.user._id,
      title,
      description,
      category,
      image: imagePath,
      status: 'Pending',
      statusHistory: [
        {
          status: 'Pending',
          updatedBy: req.user._id,
          comment: 'Complaint registered successfully.',
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints (Student gets their own, Admin gets all)
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const skip = (page - 1) * limit;

    // Build query filter
    const query = {};

    // 1. Role separation
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    }

    // 2. Category filtering
    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    // 3. Status filtering
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    // 4. Title/Description search
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Sort options
    let sortQuery = { createdAt: -1 }; // Default: Latest first
    if (req.query.sort === 'oldest') {
      sortQuery = { createdAt: 1 };
    }

    // Run query
    const complaints = await Complaint.find(query)
      .populate('studentId', 'name email role')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    // Get count for pagination metadata
    const total = await Complaint.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      count: complaints.length,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('studentId', 'name email role')
      .populate('statusHistory.updatedBy', 'name role');

    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }

    // Security check: Students can only view their own complaints
    if (
      req.user.role === 'student' &&
      complaint.studentId._id.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error('Unauthorized access: This complaint does not belong to you.');
    }

    res.json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status (Admin) or edit details (Student)
// @route   PUT /api/complaints/:id
// @access  Private
const updateComplaint = async (req, res, next) => {
  try {
    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }

    // 1. ADMIN action: Update complaint status
    if (req.user.role === 'admin') {
      const { status, comment } = req.body;

      if (!status) {
        res.status(400);
        throw new Error('Please specify new status');
      }

      if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status option');
      }

      complaint.status = status;
      complaint.statusHistory.push({
        status,
        updatedBy: req.user._id,
        comment: comment || `Status updated to ${status} by admin.`,
      });

      await complaint.save();

      // Fetch freshly populated complaint to return
      const updated = await Complaint.findById(req.params.id)
        .populate('studentId', 'name email role')
        .populate('statusHistory.updatedBy', 'name role');

      return res.json({
        success: true,
        message: `Complaint status successfully updated to ${status}`,
        data: updated,
      });
    }

    // 2. STUDENT action: Edit details (only allowed if status is 'Pending')
    if (req.user.role === 'student') {
      if (complaint.studentId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Unauthorized: You cannot edit another student\'s complaint.');
      }

      if (complaint.status !== 'Pending') {
        res.status(400);
        throw new Error('Forbidden: You can only edit complaints that are still Pending.');
      }

      const { title, description, category } = req.body;

      if (title) complaint.title = title;
      if (description) complaint.description = description;
      if (category) complaint.category = category;

      // Handle image updates
      if (req.file) {
        // Delete old image if it exists
        if (complaint.image) {
          const oldPath = path.join(__dirname, '..', complaint.image);
          if (fs.existsSync(oldPath)) {
            try {
              fs.unlinkSync(oldPath);
            } catch (err) {
              console.error('Failed to delete old image file:', err.message);
            }
          }
        }
        complaint.image = `/uploads/${req.file.filename}`;
      }

      await complaint.save();

      const updated = await Complaint.findById(req.params.id)
        .populate('studentId', 'name email role')
        .populate('statusHistory.updatedBy', 'name role');

      return res.json({
        success: true,
        message: 'Complaint updated successfully',
        data: updated,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint (Admin can filter spam; Student can delete if pending)
// @route   DELETE /api/complaints/:id
// @access  Private
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }

    // Authorization checks
    if (req.user.role === 'student') {
      if (complaint.studentId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Unauthorized: You cannot delete another student\'s complaint.');
      }

      if (complaint.status !== 'Pending') {
        res.status(400);
        throw new Error('Forbidden: You can only delete complaints that are still Pending.');
      }
    }

    // Delete image from server disk if exists
    if (complaint.image) {
      const imgPath = path.join(__dirname, '..', complaint.image);
      if (fs.existsSync(imgPath)) {
        try {
          fs.unlinkSync(imgPath);
        } catch (err) {
          console.error('Failed to delete image file on ticket removal:', err.message);
        }
      }
    }

    await Complaint.deleteOne({ _id: complaint._id });

    res.json({
      success: true,
      message: 'Complaint deleted successfully',
      id: complaint._id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
};
