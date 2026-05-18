const ForumPost = require('../models/ForumPost');

// @desc    Get all forum discussion posts
// @route   GET /api/forum
// @access  Private
const getPosts = async (req, res, next) => {
  try {
    const posts = await ForumPost.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new discussion post
// @route   POST /api/forum
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { body, tag } = req.body;

    if (!body) {
      res.status(400);
      throw new Error('Please fill in some discussion context');
    }

    const tagColors = {
      General: '#3b82f6', // Blue
      Placements: '#ea580c', // Orange
      Technical: '#8b5cf6', // Purple
      Events: '#ec4899', // Pink
      'Study Groups': '#10b981', // Emerald
    };

    const post = await ForumPost.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1),
      body,
      tag: tag || 'General',
      tagColor: tagColors[tag] || '#3b82f6',
    });

    res.status(201).json({
      success: true,
      message: 'Post published successfully!',
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like / Unlike a post
// @route   POST /api/forum/:id/like
// @access  Private
const likePost = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Forum thread not found');
    }

    const likeIndex = post.likes.indexOf(req.user._id);
    if (likeIndex === -1) {
      // Like
      post.likes.push(req.user._id);
    } else {
      // Unlike
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    res.json({
      success: true,
      likesCount: post.likes.length,
      hasLiked: likeIndex === -1,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Comment on a discussion post
// @route   POST /api/forum/:id/comment
// @access  Private
const commentPost = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      res.status(400);
      throw new Error('Comment reply cannot be empty');
    }

    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      res.status(404);
      throw new Error('Forum thread not found');
    }

    post.comments.push({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1),
      text,
    });

    await post.save();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: post.comments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  createPost,
  likePost,
  commentPost,
};
