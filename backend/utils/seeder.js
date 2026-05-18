const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Suggestion = require('../models/Suggestion');
const Event = require('../models/Event');
const Mentor = require('../models/Mentor');
const ForumPost = require('../models/ForumPost');
const Notification = require('../models/Notification');
const Book = require('../models/Book');
const Facility = require('../models/Facility');
const connectDB = require('../config/db');

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('[Seeder]: Cleaning existing collections...');
    await User.deleteMany();
    await Complaint.deleteMany();
    await Suggestion.deleteMany();
    await Event.deleteMany();
    await Mentor.deleteMany();
    await ForumPost.deleteMany();
    await Notification.deleteMany();
    await Book.deleteMany();
    await Facility.deleteMany();

    console.log('[Seeder]: Creating sample users...');
    
    // Create Admin User
    const admin = await User.create({
      name: 'Dr. Professor Roy',
      email: 'admin@college.edu',
      password: 'adminpassword123',
      role: 'admin',
      dept: 'Computer Engineering',
      prn: 'FAC001',
    });

    // Create Faculty User
    const faculty = await User.create({
      name: 'Dr. Priya Kulkarni',
      email: 'faculty@college.edu',
      password: 'facultypassword123',
      role: 'faculty',
      dept: 'Computer Engineering',
      prn: 'FAC012',
    });

    // Create Alumni User
    const alumni = await User.create({
      name: 'Rahul Deshmukh',
      email: 'alumni@college.edu',
      password: 'alumnipassword123',
      role: 'alumni',
      dept: 'Information Technology',
      prn: 'ALU2018045',
    });

    // Create Student Users
    const studentA = await User.create({
      name: 'Vedant Vijaylakhe',
      email: 'vedant@student.edu',
      password: 'studentpassword123',
      role: 'student',
      prn: 'PCCOER2021001',
      dept: 'Computer Engineering',
      year: 'TE',
    });

    const studentB = await User.create({
      name: 'Aditya Sen',
      email: 'aditya@student.edu',
      password: 'studentpassword123',
      role: 'student',
      prn: 'PCCOER2022018',
      dept: 'ENTC',
      year: 'SE',
    });

    console.log('[Seeder]: Successfully created users!');

    // Create Mentor Profile for Alumni
    console.log('[Seeder]: Creating mentor profiles...');
    const mentorA = await Mentor.create({
      userId: alumni._id,
      name: alumni.name,
      role: 'Senior Software Engineer',
      company: 'Google',
      skills: ['React', 'Node.js', 'System Design', 'Algorithms'],
      color: '#ea580c', // Orange accent
      guidanceBlogs: [
        {
          title: 'Cracking the Google Off-Campus Internship',
          content: 'Keep your DSA extremely sharp. Focus on trees, graphs, dynamic programming, and system optimization. Make sure your PCCOER final projects are live.',
          category: 'Internship Tips',
        },
        {
          title: 'My Journey from PCCOER IT to FAANG',
          content: 'Consistency is key. Participate in campus hackathons. Maintain a strong CGPA (>8.5) and collaborate actively on open-source platforms.',
          category: 'Placement Experience',
        }
      ],
      requests: [
        {
          studentId: studentB._id,
          studentName: studentB.name,
          studentEmail: studentB.email,
          message: 'Hi Rahul, I need some guidance on prep strategies for Google STEP program. Let me know if we can connect.',
          status: 'Pending',
        }
      ]
    });

    // Create Mock Complaints
    console.log('[Seeder]: Creating mock complaints...');
    const complaints = [
      {
        studentId: studentA._id,
        title: 'Hostel Block C Common Room Wi-Fi Down',
        description: 'The Wi-Fi in the Block C Hostel common room has been disconnected since yesterday morning. It keeps displaying "Obtaining IP address" but never connects. This is impacting our final project preparation.',
        category: 'WiFi',
        status: 'Pending',
        assignedDept: 'IT Support Services',
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: studentA._id,
            comment: 'Complaint registered successfully.',
          },
        ],
      },
      {
        studentId: studentA._id,
        title: 'Water Leakage in Chemistry Lab 3',
        description: 'There is a severe water leakage under the washbasin in Chemistry Lab 3 (Ground Floor). It is creating a large puddle which makes the floor extremely slippery and dangerous.',
        category: 'Water Leakage',
        status: 'In Progress',
        assignedDept: 'Facilities Maintenance',
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: studentA._id,
            comment: 'Complaint registered successfully.',
          },
          {
            status: 'In Progress',
            updatedBy: admin._id,
            comment: 'Assigned to the plumbing department. Staff will visit Lab 3 tomorrow morning.',
            updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        ],
      },
      {
        studentId: studentB._id,
        title: 'Broken Bench in Room 402',
        description: 'The third bench in the middle row of Room 402 has a loose support leg and is tilting dangerously. Two students almost fell today.',
        category: 'Classroom',
        status: 'Resolved',
        assignedDept: 'Estate Development',
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: studentB._id,
            comment: 'Complaint registered successfully.',
          },
          {
            status: 'In Progress',
            updatedBy: admin._id,
            comment: 'Carpentry staff notified. Bench scheduled for repair/replacement.',
            updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          },
          {
            status: 'Resolved',
            updatedBy: admin._id,
            comment: 'The broken bench has been replaced with a brand new one. Tested and verified.',
            updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          },
        ],
      },
    ];
    await Complaint.insertMany(complaints);

    // Create Suggestions
    console.log('[Seeder]: Creating mock suggestions...');
    await Suggestion.create([
      {
        studentId: studentA._id,
        studentName: studentA.name,
        title: 'Extended Library Reading Hours',
        description: 'The central library should remain open until 10:00 PM during mid-semester and university exams to help students prepare in a quiet environment.',
        category: 'Academics',
        votes: 18,
        votedUsers: [studentB._id],
        isAnonymous: false,
        status: 'Approved',
      },
      {
        studentId: studentB._id,
        studentName: studentB.name,
        title: 'EV Charging Outlets in Parking Lots',
        description: 'As many students and faculty have transitioned to electric two-wheelers, installing standard charging outlets near the gates would be highly beneficial.',
        category: 'Infrastructure',
        votes: 12,
        isAnonymous: true,
        status: 'Under Review',
      }
    ]);

    // Create Events
    console.log('[Seeder]: Creating mock events...');
    await Event.create([
      {
        title: 'PCCOER Smart Campus Hackathon 2026',
        description: 'Build innovative software and hardware products to tackle everyday university administrative, safety, and learning problems. Generous cash rewards for top 3 teams!',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        location: 'PCCOER Computer Center',
        category: 'Hackathon',
        slots: 100,
        emoji: '💻',
        color: 'from-blue-500 to-indigo-600',
        organizer: 'PCCOER ACM Student Chapter',
        registeredStudents: [studentA._id],
      },
      {
        title: 'Seminar: Placement Strategies in Corporate Giants',
        description: 'A special guidance workshop featuring top alumni currently working in Google, TCS, Capgemini, and Cognizant sharing recruitment and interview tips.',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        location: 'Central Auditorium',
        category: 'Seminar',
        slots: 250,
        emoji: '🎤',
        color: 'from-orange-500 to-amber-600',
        organizer: 'Training & Placement Office',
        registeredStudents: [],
      }
    ]);

    // Create Books
    console.log('[Seeder]: Creating central library catalogue...');
    await Book.create([
      {
        title: 'Introduction to Algorithms (4th Edition)',
        author: 'Thomas H. Cormen, Charles E. Leiserson',
        category: 'Computer Engineering',
        available: 3,
        total: 5,
        rack: 'Rack C, Shelf 2',
        emoji: '📘',
        color: 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400',
      },
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        category: 'Software Engineering',
        available: 0,
        total: 3,
        rack: 'Rack D, Shelf 4',
        emoji: '📗',
        color: 'from-emerald-500/10 to-green-500/10 text-emerald-600 dark:text-emerald-400',
      },
      {
        title: 'Modern Operating Systems',
        author: 'Andrew S. Tanenbaum',
        category: 'Computer Engineering',
        available: 2,
        total: 4,
        rack: 'Rack E, Shelf 1',
        emoji: '📙',
        color: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400',
      }
    ]);

    // Create Facilities
    console.log('[Seeder]: Registering campus facilities...');
    await Facility.create([
      {
        name: 'Central Gymnasium',
        icon: 'Dumbbell',
        status: 'Operational',
        detail: 'Fully equipped gym located in the basement. Open Monday to Saturday: 6:00 AM - 9:00 AM & 5:00 PM - 8:00 PM.',
      },
      {
        name: 'Sports Complex Arena',
        icon: 'Trophy',
        status: 'Operational',
        detail: 'Includes indoor badminton courts, table tennis tables, and outdoor basketball court.',
      },
      {
        name: 'Chemistry Laboratory 3',
        icon: 'Microscope',
        status: 'Maintenance',
        detail: 'Under washbasin water pipeline repairs. Scheduled to reopen day after tomorrow.',
      },
      {
        name: 'Central Auditorium',
        icon: 'Tv',
        status: 'Operational',
        detail: 'A premium 350-capacity seminar space with surround acoustic setups.',
      }
    ]);

    // Create Forum Posts
    console.log('[Seeder]: Creating forum discussion threads...');
    await ForumPost.create([
      {
        userId: studentA._id,
        userName: studentA.name,
        userRole: 'Student',
        body: 'Does anyone have a recommended set of resources or tutorials to prep for the upcoming PCCOER Smart Campus Hackathon? I am planning to build a React Native ticketing utility app.',
        tag: 'Technical',
        tagColor: '#3b82f6',
        likes: [studentB._id],
        comments: [
          {
            userId: faculty._id,
            userName: faculty.name,
            userRole: 'Faculty',
            text: 'I suggest checking out Expo CLI for quick React Native bootstrapping. Look into Tailwind styling for responsive layouts.',
          },
          {
            userId: alumni._id,
            userName: alumni.name,
            userRole: 'Alumni',
            text: 'Ensure you focus heavily on offline state caching! In hackathons, judges love seeing apps that work even when campus Wi-Fi drops.',
          }
        ]
      }
    ]);

    console.log('[Seeder]: Mock seeding completed successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

seedData();
