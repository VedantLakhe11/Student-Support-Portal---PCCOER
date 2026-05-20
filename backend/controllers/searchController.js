const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Post = require('../models/Post');
const Project = require('../models/Project');
const Book = require('../models/Book');

// @desc    Global Intelligent Search across users, complaints, posts, projects, books
// @route   GET /api/search
const globalSearch = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json({
        success: true,
        data: { users: [], complaints: [], posts: [], projects: [], books: [] }
      });
    }

    const regex = new RegExp(query, 'i');

    const [users, complaints, posts, projects, books] = await Promise.all([
      User.find({ $or: [{ name: regex }, { dept: regex }, { skills: { $in: [regex] } }], isBanned: false }).select('name role avatar dept year xp level skills').limit(5),
      Complaint.find({ $or: [{ title: regex }, { description: regex }], $or: [{ studentId: req.user._id }, { isAnonymous: false }] }).populate('studentId', 'name').limit(5),
      Post.find({ $or: [{ content: regex }, { hashtags: { $in: [regex] } }], isModerated: false }).populate('author', 'name role avatar').limit(5),
      Project.find({ $or: [{ title: regex }, { tags: { $in: [regex] } }] }).populate('creator', 'name avatar').limit(5),
      Book.find({ $or: [{ title: regex }, { author: regex }] }).limit(5)
    ]);

    res.json({
      success: true,
      data: {
        users,
        complaints,
        posts,
        projects,
        books
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  globalSearch
};
