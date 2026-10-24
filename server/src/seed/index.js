require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const CertificateTemplate = require('../models/CertificateTemplate');
const Budget = require('../models/Budget');
const Task = require('../models/Task');
const Announcement = require('../models/Announcement');
const Contact = require('../models/Contact');
const { generateQrToken } = require('../services/qrService');
const { generateCertificateCode } = require('../services/certificateService');

async function seed() {
  console.log('🌱 Starting CampusOS database seeding...');
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.log('⚠️ MongoDB not connected. Please provide MONGODB_URI in .env to seed data.');
    process.exit(0);
  }

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Club.deleteMany({}),
    Event.deleteMany({}),
    Registration.deleteMany({}),
    CertificateTemplate.deleteMany({}),
    Budget.deleteMany({}),
    Task.deleteMany({}),
    Announcement.deleteMany({}),
    Contact.deleteMany({}),
  ]);
  console.log('🧹 Cleaned existing database collections');

  // 1. Seed Users
  const adminUser = await User.create({
    name: 'Dr. Rajesh Sharma',
    email: 'admin@campusos.in',
    password: 'Password123!',
    role: 'admin',
    phone: '+91 98201 12345',
  });

  const leadUser = await User.create({
    name: 'Aarav Mehta',
    email: 'lead@campusos.in',
    password: 'Password123!',
    role: 'organiser',
    phone: '+91 98202 54321',
  });

  const volunteerUser = await User.create({
    name: 'Pooja Patel',
    email: 'volunteer@campusos.in',
    password: 'Password123!',
    role: 'volunteer',
    phone: '+91 98203 98765',
  });

  const studentUser = await User.create({
    name: 'Rohan Gupta',
    email: 'student@campusos.in',
    password: 'Password123!',
    role: 'participant',
    phone: '+91 98204 11223',
  });

  console.log('👤 Created demo users (admin, organiser, volunteer, participant)');

  // 2. Seed Club
  const club = await Club.create({
    name: 'ACM Student Chapter',
    slug: 'acm-vjti',
    description:
      'The premier technical and computer science society at VJTI Mumbai, organizing annual hackathons, code sprints, and open-source bootcamps.',
    institution: 'Veermata Jijabai Technological Institute (VJTI)',
    city: 'Mumbai',
    website: 'https://acm.vjti.ac.in',
    owner: leadUser._id,
    members: [
      { user: leadUser._id, role: 'admin' },
      { user: volunteerUser._id, role: 'volunteer' },
    ],
    plan: 'club',
    planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  });

  // Link users to club
  await User.findByIdAndUpdate(leadUser._id, { club: club._id });
  await User.findByIdAndUpdate(volunteerUser._id, { club: club._id });

  console.log(`🏛️ Created club: ${club.name} (Plan: ${club.plan})`);

  // 3. Seed Events
  const hackathon = await Event.create({
    club: club._id,
    createdBy: leadUser._id,
    title: 'HackMumbai 2026',
    slug: 'hackmumbai-2026',
    description:
      'A 36-hour national level offline hackathon bringing together 500+ top student developers, designers, and innovators to solve real-world problems in FinTech, EdTech, Climate, and AI.',
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    venue: 'VJTI Central Auditorium & Innovation Lab, Matunga, Mumbai',
    capacity: 500,
    registrationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    rules:
      '1. Teams of 2-4 members.\n2. All code must be written during the hacking period.\n3. Mandatory physical presence with valid college ID.\n4. Decisions of jury are final.',
    schedule: [
      { time: '09:00 AM - Day 1', activity: 'Registration & Swag Check-in' },
      { time: '11:00 AM - Day 1', activity: 'Opening Ceremony & Keynote' },
      { time: '12:00 PM - Day 1', activity: 'Hacking Commences' },
      { time: '08:00 PM - Day 1', activity: 'Mentorship Checkpoint 1' },
      { time: '12:00 PM - Day 2', activity: 'Code Freeze & Pitching Round' },
      { time: '04:00 PM - Day 2', activity: 'Award Ceremony & Closing' },
    ],
    customFields: [
      { label: 'College / University', type: 'text', required: true },
      { label: 'GitHub Profile', type: 'text', required: true },
      { label: 'T-Shirt Size', type: 'select', required: true, options: ['S', 'M', 'L', 'XL'] },
    ],
    status: 'published',
    isPublic: true,
    registrationCount: 12,
    attendanceCount: 4,
    plan: 'club',
  });

  const workshop = await Event.create({
    club: club._id,
    createdBy: leadUser._id,
    title: 'Agentic AI & LLMs in Production',
    slug: 'agentic-ai-workshop',
    description:
      'Hands-on masterclass on building autonomous multi-agent systems using LangChain, modern model APIs, and vector databases.',
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    venue: 'Seminar Hall 3, Department of Computer Engineering',
    capacity: 120,
    registrationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    rules: 'Bring your laptop with Node.js and Python installed.',
    status: 'published',
    isPublic: true,
    registrationCount: 4,
    attendanceCount: 0,
    plan: 'club',
  });

  // Seed Event Templates
  await Event.create({
    club: club._id,
    createdBy: leadUser._id,
    title: '24-Hour Hackathon Format',
    templateName: 'Flagship 24-Hour Hackathon',
    isTemplate: true,
    description: 'Standardized blueprint for student hackathons with judging criteria and checkpoints.',
    venue: 'College Main Auditorium',
    capacity: 300,
    rules: 'Teams of 3-4. Fresh code only.',
    status: 'draft',
    startDate: new Date(),
    endDate: new Date(),
  });

  await Event.create({
    club: club._id,
    createdBy: leadUser._id,
    title: 'Technical Hands-on Workshop',
    templateName: '3-Hour Hands-on Workshop',
    isTemplate: true,
    description: 'Structure for hands-on tech workshops with pre-requisites and setup instructions.',
    venue: 'Computer Lab 4',
    capacity: 80,
    rules: 'Laptops mandatory.',
    status: 'draft',
    startDate: new Date(),
    endDate: new Date(),
  });

  console.log('📅 Seeded events and event templates');

  // 4. Seed Registrations
  const sampleParticipants = [
    { name: 'Aditya Kulkarni', email: 'aditya.k@gmail.com', phone: '9876543210', attended: true },
    { name: 'Sneha Rao', email: 'sneha.rao@gmail.com', phone: '9876543211', attended: true },
    { name: 'Tanmay Bhatt', email: 'tanmay.b@gmail.com', phone: '9876543212', attended: true },
    { name: 'Priyanka Sen', email: 'priyanka.s@gmail.com', phone: '9876543213', attended: true },
    { name: 'Vikram Deshmukh', email: 'vikram.d@gmail.com', phone: '9876543214', attended: false },
    { name: 'Ananya Verma', email: 'ananya.v@gmail.com', phone: '9876543215', attended: false },
    { name: 'Nikhil Jain', email: 'nikhil.j@gmail.com', phone: '9876543216', attended: false },
    { name: 'Meera Nambiar', email: 'meera.n@gmail.com', phone: '9876543217', attended: false },
  ];

  for (const p of sampleParticipants) {
    const reg = await Registration.create({
      event: hackathon._id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      status: 'confirmed',
      attended: p.attended,
      checkedInAt: p.attended ? new Date() : null,
      checkedInBy: p.attended ? volunteerUser._id : null,
      certificateCode: generateCertificateCode(hackathon._id),
      answers: [
        { label: 'College / University', value: 'VJTI Mumbai' },
        { label: 'GitHub Profile', value: `https://github.com/${p.name.toLowerCase().replace(' ', '')}` },
        { label: 'T-Shirt Size', value: 'M' },
      ],
    });

    reg.qrToken = generateQrToken(reg._id, hackathon._id);
    await reg.save();
  }

  console.log(`🎟️ Seeded ${sampleParticipants.length} attendee registrations`);

  // 5. Seed Certificate Template
  await CertificateTemplate.create({
    event: hackathon._id,
    club: club._id,
    createdBy: leadUser._id,
    title: 'Certificate of Excellence & Participation',
    subtitle: 'This is proudly presented to',
    body: 'for outstanding innovation and successful participation in HackMumbai 2026.',
    issuerName: 'Dr. Rajesh Sharma',
    issuerTitle: 'Head of Computer Engineering & Faculty Advisor',
    signatoryName: 'Aarav Mehta',
    signatoryTitle: 'President, ACM Student Chapter',
    style: 'modern',
  });

  console.log('📜 Seeded certificate template');

  // 6. Seed Budget
  await Budget.create({
    event: hackathon._id,
    club: club._id,
    createdBy: leadUser._id,
    totalBudget: 150000,
    expenses: [
      { category: 'Catering & Food', description: 'Meals and refreshments for 36 hours', expected: 65000, actual: 62000, paidBy: 'College Accounts' },
      { category: 'Prizes & Goodies', description: 'Winner cash prizes and trophies', expected: 45000, actual: 45000, paidBy: 'Sponsor Fund' },
      { category: 'Swag & Badges', description: 'T-Shirts, stickers, and lanyard cards', expected: 25000, actual: 23500, paidBy: 'ACM Treasury' },
      { category: 'Audio / Visuals', description: 'Auditorium projector, mic & sound setup', expected: 15000, actual: 14000, paidBy: 'College Accounts' },
    ],
    income: [
      { source: 'DevPaaS Global', description: 'Title Sponsor Grant', expected: 80000, actual: 80000 },
      { source: 'TechCloud Foundation', description: 'Associate Sponsor', expected: 40000, actual: 40000 },
      { source: 'College Student Council', description: 'Annual Activity Grant', expected: 30000, actual: 30000 },
    ],
    notes: 'Approved by Dean of Student Affairs on 15th October 2026.',
  });

  console.log('💰 Seeded event budget, expenses and sponsor income');

  // 7. Seed Tasks
  await Task.create([
    {
      event: hackathon._id,
      club: club._id,
      createdBy: leadUser._id,
      assignedTo: volunteerUser._id,
      title: 'Verify Gate 1 QR tickets & attendee badges',
      description: 'Use the CampusOS QR Scanner on phone to check in participants at the entry gate.',
      status: 'in_progress',
      priority: 'high',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      event: hackathon._id,
      club: club._id,
      createdBy: leadUser._id,
      assignedTo: volunteerUser._id,
      title: 'Setup high-speed WiFi routers in Innovation Lab',
      description: 'Coordinate with Campus IT department for 500 concurrent connections.',
      status: 'done',
      priority: 'high',
      deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
    {
      event: hackathon._id,
      club: club._id,
      createdBy: leadUser._id,
      title: 'Distribute midnight energy drinks & snacks',
      description: 'Snack kits for 500 hackers at 1:00 AM.',
      status: 'todo',
      priority: 'medium',
      deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    },
  ]);

  console.log('📋 Seeded volunteer tasks');

  // 8. Seed Announcements
  await Announcement.create({
    event: hackathon._id,
    club: club._id,
    createdBy: leadUser._id,
    title: 'HackMumbai 2026: Discord Server & Check-in Details',
    message: 'Welcome hackers! Please join our official Discord server and ensure your QR tickets are downloaded on your phone before arriving at Gate 1.',
    sentTo: 8,
    emailSent: true,
  });

  console.log('📢 Seeded event announcement');

  // 9. Seed Contact Inquiries
  await Contact.create([
    {
      name: 'Prof. S. K. Kulkarni',
      email: 'sk.kulkarni@coep.ac.in',
      phone: '+91 94220 12345',
      institution: 'COEP Technological University, Pune',
      role: 'Dean of Student Affairs',
      type: 'demo',
      message: 'We are interested in adopting CampusOS across 45 student clubs for our upcoming academic session.',
      status: 'new',
    },
    {
      name: 'Riddhi Patel',
      email: 'riddhi@rotaract.org',
      institution: 'Rotaract Youth Club',
      role: 'Club President',
      type: 'contact',
      message: 'Does CampusOS support hybrid events with online certificate verification?',
      status: 'contacted',
    },
  ]);

  console.log('📬 Seeded contact & demo inquiries');

  console.log('\n===========================================');
  console.log('🎉 CampusOS Database Seeded Successfully!');
  console.log('===========================================');
  console.log('Demo Credentials:');
  console.log('  Admin:       admin@campusos.in      / Password123!');
  console.log('  Organiser:   lead@campusos.in       / Password123!');
  console.log('  Volunteer:   volunteer@campusos.in  / Password123!');
  console.log('  Participant: student@campusos.in    / Password123!');
  console.log('===========================================\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
