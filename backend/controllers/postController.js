const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Get all feed posts (paginated, filterable by category, tags, saves)
// @route   GET /api/posts
const getPosts = async (req, res, next) => {
  try {
    const { category, tag, savesOnly, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = { isModerated: false };

    if (category && category !== 'All' && category !== 'General') {
      query.category = category;
    }
    if (tag) {
      query.hashtags = { $in: [tag] };
    }
    if (savesOnly === 'true') {
      query.saves = req.user._id;
    }

    const posts = await Post.find(query)
      .populate('author', 'name role avatar dept year xp level')
      .populate('comments.author', 'name role avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a post
// @route   POST /api/posts
const createPost = async (req, res, next) => {
  try {
    const { content, mediaUrl, mediaType, category, hashtags, pollQuestion, pollOptions } = req.body;

    if (!content) {
      res.status(400);
      throw new Error('Post content is required');
    }

    let poll = undefined;
    if (pollQuestion && pollOptions && pollOptions.length >= 2) {
      poll = {
        question: pollQuestion,
        options: pollOptions.map(opt => ({ text: opt, votes: [] }))
      };
    }

    // Process hashtags
    let parsedTags = [];
    if (hashtags) {
      parsedTags = hashtags.split(',').map(tag => tag.trim().toLowerCase().replace('#', '')).filter(Boolean);
    }

    const post = await Post.create({
      author: req.user._id,
      content,
      mediaUrl: mediaUrl || '',
      mediaType: mediaType || '',
      category: category || 'General',
      hashtags: parsedTags,
      poll,
    });

    // Grant 10 XP points for active contributions
    req.user.xp += 10;
    if (req.user.xp >= req.user.level * 50) {
      req.user.level += 1;
      req.user.badges.push(`Level ${req.user.level} Creator`);
    }
    await req.user.save();

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name role avatar dept year xp level');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: populatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on a post
// @route   POST /api/posts/:id/like
const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const index = post.likes.indexOf(req.user._id);
    if (index > -1) {
      post.likes.splice(index, 1); // Unlike
    } else {
      post.likes.push(req.user._id); // Like
    }

    await post.save();
    res.json({
      success: true,
      data: post.likes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle save on a post
// @route   POST /api/posts/:id/save
const savePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const index = post.saves.indexOf(req.user._id);
    if (index > -1) {
      post.saves.splice(index, 1); // Unsave
    } else {
      post.saves.push(req.user._id); // Save
    }

    await post.save();
    res.json({
      success: true,
      data: post.saves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote in a post's poll
// @route   POST /api/posts/:id/poll/:optionId/vote
const votePoll = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const { optionId } = req.params;

    // Check if user has already voted on any option in this poll
    post.poll.options.forEach(opt => {
      opt.votes = opt.votes.filter(v => v.toString() !== req.user._id.toString());
    });

    // Add user vote to selected option
    const option = post.poll.options.id(optionId);
    if (!option) {
      res.status(400);
      throw new Error('Option not found');
    }
    option.votes.push(req.user._id);

    await post.save();
    res.json({
      success: true,
      data: post.poll,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comment
const addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const { text } = req.body;
    if (!text) {
      res.status(400);
      throw new Error('Comment text is required');
    }

    post.comments.push({
      author: req.user._id,
      text,
    });

    await post.save();

    // Grant 2 XP points for engaging in discussions
    req.user.xp += 2;
    if (req.user.xp >= req.user.level * 50) {
      req.user.level += 1;
      req.user.badges.push(`Level ${req.user.level} Commenter`);
    }
    await req.user.save();

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name role avatar dept year xp level')
      .populate('comments.author', 'name role avatar');

    res.status(201).json({
      success: true,
      data: populatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report a post for moderation
// @route   POST /api/posts/:id/report
const reportPost = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    post.reports.push({
      reporter: req.user._id,
      reason: reason || 'Inappropriate Content',
    });

    await post.save();
    res.json({
      success: true,
      message: 'Post reported successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dynamic trending tags list
// @route   GET /api/posts/trending-tags
const getTrendingTags = async (req, res, next) => {
  try {
    const posts = await Post.find({ isModerated: false, hashtags: { $exists: true, $not: { $size: 0 } } });
    
    let tagCount = {};
    posts.forEach(post => {
      post.hashtags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    const trending = Object.entries(tagCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    res.json({
      success: true,
      data: trending,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  createPost,
  likePost,
  savePost,
  votePoll,
  addComment,
  reportPost,
  getTrendingTags,
};
