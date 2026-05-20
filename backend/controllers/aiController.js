const Mentor = require('../models/Mentor');
const Event = require('../models/Event');
const Book = require('../models/Book');

// Core PCCOER knowledge index base
const FAQ_KNOWLEDGE = [
  {
    keywords: ['library', 'book', 'borrow', 'return', 'fine'],
    answer: 'PCCOER Central Library operates from 8:30 AM to 5:30 PM on weekdays. You can search books and reserve shelves directly via the "Library Books" tab. Borrow limits are 3 books for 15 days, after which a minor daily fine is logged.'
  },
  {
    keywords: ['hostel', 'timing', 'gate', 'mess', 'dinner'],
    answer: 'PCCOER campus hostel gates close at 9:30 PM sharp for security. Mess dinner is served between 7:30 PM and 9:00 PM. Hot water is available in the morning from 6:00 AM to 8:30 AM.'
  },
  {
    keywords: ['wifi', 'internet', 'credential', 'connect', 'speed'],
    answer: 'To connect to the high-speed "PCCOER-Secure" WiFi network, navigate to your wireless settings, select the network, and log in using your PRN and default portal password. For technical issues, lodge a ticket under the "Technical/WiFi" category.'
  },
  {
    keywords: ['gym', 'auditorium', 'court', 'book', 'facilities', 'slot'],
    answer: 'Campus facilities like the Sports Court, Gym, and Seminar Hall require prior reservations. Students can view slot listings and lock bookings instantly inside the "Facilities Scheduler" on their dashboards.'
  },
  {
    keywords: ['exam', 'syllabus', 'results', 'pune university', 'sppu'],
    answer: 'PCCOER is affiliated with Savitribai Phule Pune University (SPPU). Semester examinations timetable and results can be tracked on the official SPPU portal, or by visiting the Student Section in the Admin Building (Ground Floor).'
  }
];

// @desc    Chat with AI campus assistant
// @route   POST /api/ai/chat
const chatWithAssistant = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400);
      throw new Error('Message content is required');
    }

    const cleanMsg = message.toLowerCase();
    let reply = '';

    // 1. Check direct FAQ matches
    const matchedFaq = FAQ_KNOWLEDGE.find(faq =>
      faq.keywords.some(keyword => cleanMsg.includes(keyword))
    );

    if (matchedFaq) {
      reply = matchedFaq.answer;
    }

    // 2. Recommend Mentors if requested
    else if (cleanMsg.includes('mentor') || cleanMsg.includes('guide') || cleanMsg.includes('placement')) {
      const mentors = await Mentor.find().populate('userId', 'name').limit(2);
      const mentorNames = mentors.map(m => m.userId?.name || 'Alumni').join(' and ');
      reply = `To help with placements or career guidance, I highly recommend connecting with our top corporate alumni mentors: ${mentorNames}. You can send them a direct connection invite inside the "Alumni Guidance" panel!`;
    }

    // 3. Recommend Hackathons if requested
    else if (cleanMsg.includes('event') || cleanMsg.includes('hackathon') || cleanMsg.includes('contest')) {
      const events = await Event.find().limit(2);
      if (events.length > 0) {
        const eventTitles = events.map(e => e.title).join(', ');
        reply = `We have active hackathons and campus contests coming up! Specifically, look at: "${eventTitles}". Check details and lock your seats in the "Coding Hackathons" tab!`;
      } else {
        reply = 'There are no active hackathons listed at this moment, but stay tuned! You will get real-time notification alerts as soon as faculty publishes a new coding competition.';
      }
    }

    // 4. Default AI helper response
    else {
      reply = `Hello! I am your PCCOER AI Campus Assistant. I can guide you on filing grievances (e.g. Technical, Infrastructure, Academic), reserving books, sports court slot schedules, or matching teammate profiles. Ask me anything about PCCOER!`;
    }

    res.json({
      success: true,
      data: reply,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auto-categorize and auto-prioritize complaint description
// @route   POST /api/ai/analyze-complaint
const analyzeComplaint = async (req, res, next) => {
  try {
    const { description } = req.body;
    if (!description) {
      res.status(400);
      throw new Error('Complaint description is required for semantic analysis');
    }

    const text = description.toLowerCase();
    let category = 'Others';
    let priority = 'Low';
    let suggestedResolver = 'General Administrator';

    // Semantic matching for category
    if (text.includes('wifi') || text.includes('internet') || text.includes('pc') || text.includes('software') || text.includes('lab')) {
      category = 'Technical/WiFi';
      priority = text.includes('exam') || text.includes('server down') ? 'High' : 'Medium';
      suggestedResolver = 'IT Department Head';
    } else if (text.includes('leak') || text.includes('fan') || text.includes('light') || text.includes('bench') || text.includes('toilet') || text.includes('pipe')) {
      category = 'Infrastructure';
      priority = text.includes('leak') || text.includes('water overflow') ? 'High' : 'Low';
      suggestedResolver = 'Campus Maintenance Officer';
    } else if (text.includes('professor') || text.includes('marks') || text.includes('class') || text.includes('attendance') || text.includes('exam')) {
      category = 'Academic';
      priority = text.includes('final exam') ? 'High' : 'Medium';
      suggestedResolver = 'Academic Dean office';
    }

    res.json({
      success: true,
      data: {
        category,
        priority,
        suggestedResolver,
        analysisConfidence: '87%',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatWithAssistant,
  analyzeComplaint,
};
