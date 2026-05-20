const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all collaboration projects
// @route   GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const { search, tag } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (tag) {
      query.tags = { $in: [tag] };
    }

    const projects = await Project.find(query)
      .populate('creator', 'name role avatar dept year xp level skills bio')
      .populate('teammates', 'name role avatar dept year xp level skills')
      .populate('teamRequests.user', 'name role avatar dept year xp level skills')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a project
// @route   POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { title, description, tags, githubUrl, demoUrl, rolePositions } = req.body;

    if (!title || !description) {
      res.status(400);
      throw new Error('Project title and description are required');
    }

    let parsedTags = [];
    if (tags) {
      parsedTags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    let parsedRoles = [];
    if (rolePositions) {
      parsedRoles = Array.isArray(rolePositions) ? rolePositions : rolePositions.split(',').map(role => role.trim()).filter(Boolean);
    }

    const project = await Project.create({
      title,
      description,
      creator: req.user._id,
      tags: parsedTags,
      githubUrl: githubUrl || '',
      demoUrl: demoUrl || '',
      teammates: [req.user._id],
      rolePositions: parsedRoles,
    });

    // Grant 15 XP points for initiating new projects
    req.user.xp += 15;
    if (req.user.xp >= req.user.level * 50) {
      req.user.level += 1;
      req.user.badges.push(`Level ${req.user.level} Founder`);
    }
    await req.user.save();

    const populatedProject = await Project.findById(project._id)
      .populate('creator', 'name role avatar dept year xp level skills')
      .populate('teammates', 'name role avatar dept year xp level skills');

    res.status(201).json({
      success: true,
      message: 'Project showcase created successfully',
      data: populatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request to join a project team
// @route   POST /api/projects/:id/join
const requestToJoin = async (req, res, next) => {
  try {
    const { role, message } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    if (project.creator.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You are already the creator of this project');
    }

    // Check if request already exists
    const requestExists = project.teamRequests.some(
      (r) => r.user.toString() === req.user._id.toString() && r.status === 'pending'
    );

    if (requestExists) {
      res.status(400);
      throw new Error('You already have a pending join request for this project');
    }

    project.teamRequests.push({
      user: req.user._id,
      role: role || 'Collaborator',
      message: message || '',
    });

    await project.save();
    res.json({
      success: true,
      message: 'Application request submitted to founder!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to project join request
// @route   POST /api/projects/:id/respond/:requestId
const respondToRequest = async (req, res, next) => {
  try {
    const { action } = req.body; // 'approved' or 'rejected'
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    if (project.creator.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to moderate team requests on this showcase');
    }

    const request = project.teamRequests.id(req.params.requestId);
    if (!request) {
      res.status(404);
      throw new Error('Join request not found');
    }

    request.status = action;

    if (action === 'approved') {
      if (!project.teammates.includes(request.user)) {
        project.teammates.push(request.user);
      }
      
      // Award matching candidate 10 XP points
      const candidate = await User.findById(request.user);
      if (candidate) {
        candidate.xp += 10;
        candidate.badges.push(`Hackathon Team Member`);
        await candidate.save();
      }
    }

    await project.save();
    res.json({
      success: true,
      message: `Teammate application successfully ${action}!`,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get skill matches for dynamic teammate matchmaking
// @route   GET /api/projects/matchmaking
const getSkillMatches = async (req, res, next) => {
  try {
    const userSkills = req.user.skills || [];
    if (userSkills.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Find users with intersecting skills
    const matches = await User.find({
      _id: { $ne: req.user._id },
      skills: { $in: userSkills },
      isBanned: false,
    })
      .select('name email role avatar dept year xp level skills bio')
      .limit(10);

    res.json({
      success: true,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  requestToJoin,
  respondToRequest,
  getSkillMatches,
};
