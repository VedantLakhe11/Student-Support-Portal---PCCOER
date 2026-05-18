const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Complaint = require('../models/Complaint');
const connectDB = require('../config/db');

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('[Seeder]: Cleaning existing collections...');
    await User.deleteMany();
    await Complaint.deleteMany();

    console.log('[Seeder]: Creating sample users...');
    
    // Create Admin User
    const admin = await User.create({
      name: 'Professor Roy (Admin)',
      email: 'admin@college.edu',
      password: 'adminpassword123',
      role: 'admin',
    });

    // Create Student Users
    const studentA = await User.create({
      name: 'Vedant Vijaylakhe',
      email: 'vedant@student.edu',
      password: 'studentpassword123',
      role: 'student',
    });

    const studentB = await User.create({
      name: 'Aditya Sen',
      email: 'aditya@student.edu',
      password: 'studentpassword123',
      role: 'student',
    });

    console.log('[Seeder]: Successfully created users!');
    console.log(`- Admin Account: ${admin.email} (password: adminpassword123)`);
    console.log(`- Student A Account: ${studentA.email} (password: studentpassword123)`);
    console.log(`- Student B Account: ${studentB.email} (password: studentpassword123)`);

    console.log('[Seeder]: Creating mock complaints...');

    const complaints = [
      {
        studentId: studentA._id,
        title: 'Hostel Block C Common Room Wi-Fi Down',
        description: 'The Wi-Fi in the Block C Hostel common room has been disconnected since yesterday morning. It keeps displaying "Obtaining IP address" but never connects. This is impacting our final project preparation.',
        category: 'Wi-Fi',
        status: 'Pending',
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
            updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          },
        ],
      },
      {
        studentId: studentB._id,
        title: 'Broken Bench in Room 402',
        description: 'The third bench in the middle row of Room 402 has a loose support leg and is tilting dangerously. Two students almost fell today.',
        category: 'Classroom Issue',
        status: 'Resolved',
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
      {
        studentId: studentB._id,
        title: 'Unclean corridor on Hostel 2nd floor',
        description: 'The corridor dustbins in Hostel Block B second floor are overflowing and haven\'t been cleared for two days. It is causing a bad odor.',
        category: 'Cleanliness',
        status: 'Pending',
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: studentB._id,
            comment: 'Complaint registered successfully.',
          },
        ],
      },
    ];

    await Complaint.insertMany(complaints);
    console.log('[Seeder]: Successfully created mock complaints!');
    
    // Disconnect Mongoose
    mongoose.connection.close();
    console.log('[Seeder]: Seeding complete, connection closed safely.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

// Run seeder
seedData();
