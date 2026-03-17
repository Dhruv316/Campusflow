const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CampusFlow database seed...\n');

  await prisma.certificate.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  const hash = (pwd) => bcrypt.hash(pwd, 12);
  const now = new Date();
  const daysFromNow = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
  const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  // Admin
  const admin = await prisma.user.create({
    data: { id: uuidv4(), name: 'Campus Admin', email: 'admin@campusflow.app', password: await hash('Admin@123'), role: 'ADMIN', department: 'Administration', phone: '+91-9000000001', isActive: true },
  });
  console.log('✅ Admin created: admin@campusflow.app');

  // Students
  const arjun = await prisma.user.create({ data: { id: uuidv4(), name: 'Arjun Sharma', email: 'arjun.sharma@student.campusflow.app', password: await hash('Student@123'), role: 'STUDENT', rollNumber: 'CS2021001', department: 'Computer Science', year: 3, phone: '+91-9000000002', isActive: true } });
  const priya = await prisma.user.create({ data: { id: uuidv4(), name: 'Priya Nair', email: 'priya.nair@student.campusflow.app', password: await hash('Student@123'), role: 'STUDENT', rollNumber: 'EC2022045', department: 'Electronics & Communication', year: 2, phone: '+91-9000000003', isActive: true } });
  const rahul = await prisma.user.create({ data: { id: uuidv4(), name: 'Rahul Mehta', email: 'rahul.mehta@student.campusflow.app', password: await hash('Student@123'), role: 'STUDENT', rollNumber: 'ME2020078', department: 'Mechanical Engineering', year: 4, phone: '+91-9000000004', isActive: true } });
  const sneha = await prisma.user.create({ data: { id: uuidv4(), name: 'Sneha Kulkarni', email: 'sneha.kulkarni@student.campusflow.app', password: await hash('Student@123'), role: 'STUDENT', rollNumber: 'IT2023012', department: 'Information Technology', year: 1, phone: '+91-9000000005', isActive: true } });
  const vikram = await prisma.user.create({ data: { id: uuidv4(), name: 'Vikram Reddy', email: 'vikram.reddy@student.campusflow.app', password: await hash('Student@123'), role: 'STUDENT', rollNumber: 'CE2021033', department: 'Civil Engineering', year: 3, phone: '+91-9000000006', isActive: true } });
  console.log('✅ Students created: Arjun, Priya, Rahul, Sneha, Vikram');

  // COMPLETED events
  const hackathon2024 = await prisma.event.create({ data: { id: uuidv4(), title: 'HackIndia 2024 — National Hackathon', description: 'A 36-hour national-level hackathon where teams of 2–4 competed to build innovative solutions across FinTech, HealthTech, EdTech, and Smart Cities tracks. Over 200 teams participated with prizes worth ₹5,00,000.', category: 'TECHNICAL', status: 'COMPLETED', venue: 'Main Auditorium & Innovation Lab, Block A', startDate: daysAgo(45), endDate: daysAgo(44), registrationDeadline: daysAgo(50), maxCapacity: 200, currentRegistrations: 186, isTeamEvent: true, teamMinSize: 2, teamMaxSize: 4, tags: ['hackathon', 'coding', 'innovation', 'prize', 'national'], createdById: admin.id } });
  const culturalFest2024 = await prisma.event.create({ data: { id: uuidv4(), title: 'Resonance 2024 — Annual Cultural Fest', description: 'CampusFlow College flagship annual cultural festival with 3 days of music, dance, drama, and art. Featured celebrity performances and inter-college competitions.', category: 'CULTURAL', status: 'COMPLETED', venue: 'Open Air Amphitheatre & Campus Grounds', startDate: daysAgo(60), endDate: daysAgo(57), registrationDeadline: daysAgo(65), maxCapacity: 1500, currentRegistrations: 1342, isTeamEvent: false, tags: ['cultural', 'festival', 'music', 'dance', 'annual'], createdById: admin.id } });
  const workshop2024 = await prisma.event.create({ data: { id: uuidv4(), title: 'AI & Machine Learning Workshop', description: 'A hands-on 2-day workshop covering fundamentals of AI, machine learning, and deep learning. Participants built real projects using Python and TensorFlow under guidance of industry experts.', category: 'WORKSHOP', status: 'COMPLETED', venue: 'Computer Lab 3, Block C', startDate: daysAgo(20), endDate: daysAgo(19), registrationDeadline: daysAgo(25), maxCapacity: 60, currentRegistrations: 58, isTeamEvent: false, tags: ['AI', 'machine learning', 'python', 'workshop'], createdById: admin.id } });
  const guestLecture2024 = await prisma.event.create({ data: { id: uuidv4(), title: 'Industry Talk: Future of Web3 & Blockchain', description: 'An insightful guest lecture by Mr. Karan Mehta, CTO of BlockVentures, covering practical applications of blockchain, DeFi, NFTs, and the future of decentralized systems.', category: 'GUEST_LECTURE', status: 'COMPLETED', venue: 'Seminar Hall 1, Block B', startDate: daysAgo(10), endDate: daysAgo(10), registrationDeadline: daysAgo(12), maxCapacity: 150, currentRegistrations: 143, isTeamEvent: false, tags: ['blockchain', 'web3', 'guest lecture'], createdById: admin.id } });

  // ONGOING
  const sportsWeek = await prisma.event.create({ data: { id: uuidv4(), title: 'Inter-Department Sports Week 2025', description: 'The annual inter-department sports championship featuring cricket, football, basketball, badminton, table tennis, and athletics. Compete for your department and win the coveted Sports Champion Trophy!', category: 'SPORTS', status: 'ONGOING', venue: 'Sports Complex & Athletic Track', startDate: daysAgo(2), endDate: daysFromNow(5), registrationDeadline: daysAgo(5), maxCapacity: 500, currentRegistrations: 487, isTeamEvent: true, teamMinSize: 5, teamMaxSize: 15, tags: ['sports', 'cricket', 'football', 'inter-department'], createdById: admin.id } });

  // PUBLISHED upcoming
  const techSprint2025 = await prisma.event.create({ data: { id: uuidv4(), title: 'TechSprint 2025 — National Hackathon', description: 'A 36-hour national-level hackathon where teams compete to build innovative solutions across FinTech, HealthTech, EdTech, and Smart Cities. Prizes worth ₹5,00,000. Mentors from top product companies will guide you.', category: 'TECHNICAL', status: 'PUBLISHED', venue: 'Main Auditorium & Innovation Lab, Block A', startDate: daysFromNow(7), endDate: daysFromNow(8), registrationDeadline: daysFromNow(5), maxCapacity: 200, currentRegistrations: 47, isTeamEvent: true, teamMinSize: 2, teamMaxSize: 4, tags: ['hackathon', 'coding', 'innovation', 'prize'], createdById: admin.id } });
  const designWorkshop = await prisma.event.create({ data: { id: uuidv4(), title: 'UI/UX Design Bootcamp', description: 'A 3-day intensive bootcamp on user interface and experience design. Learn Figma, design thinking, prototyping, and user research. Best project wins a paid internship opportunity.', category: 'WORKSHOP', status: 'PUBLISHED', venue: 'Design Studio, Block D', startDate: daysFromNow(14), endDate: daysFromNow(16), registrationDeadline: daysFromNow(10), maxCapacity: 40, currentRegistrations: 31, isTeamEvent: false, tags: ['design', 'UI/UX', 'figma', 'bootcamp'], createdById: admin.id } });
  const codingContest = await prisma.event.create({ data: { id: uuidv4(), title: 'Code Wars — Competitive Programming', description: 'Test your algorithmic skills in this 4-hour competitive programming contest. Problems range from beginner to expert level. Top 3 winners get cash prizes and goodies from sponsors.', category: 'TECHNICAL', status: 'PUBLISHED', venue: 'Computer Lab 1 & 2, Block C', startDate: daysFromNow(3), endDate: daysFromNow(3), registrationDeadline: daysFromNow(2), maxCapacity: 100, currentRegistrations: 78, isTeamEvent: false, tags: ['competitive programming', 'algorithms', 'coding'], createdById: admin.id } });
  const culturalNight = await prisma.event.create({ data: { id: uuidv4(), title: 'Resonance 2025 — Annual Cultural Fest', description: 'CampusFlow flagship annual cultural festival with 4 days of music, dance, drama, and art. Celebrity performances, inter-college competitions, food fest. Biggest event of the year!', category: 'CULTURAL', status: 'PUBLISHED', venue: 'Open Air Amphitheatre & Campus Grounds', startDate: daysFromNow(30), endDate: daysFromNow(33), registrationDeadline: daysFromNow(25), maxCapacity: 2000, currentRegistrations: 234, isTeamEvent: false, tags: ['cultural', 'festival', 'music', 'dance', 'celebrity'], createdById: admin.id } });
  const placementDrive = await prisma.event.create({ data: { id: uuidv4(), title: 'Campus Placement Drive 2025', description: 'Annual campus placement drive featuring 12 top tech companies. Open to final year students from CS, IT, and ECE. Pre-placement talks followed by aptitude, technical, and HR rounds.', category: 'PLACEMENT', status: 'PUBLISHED', venue: 'Placement Cell, Admin Block', startDate: daysFromNow(21), endDate: daysFromNow(23), registrationDeadline: daysFromNow(15), maxCapacity: 300, currentRegistrations: 189, isTeamEvent: false, tags: ['placement', 'jobs', 'campus recruitment'], createdById: admin.id } });
  const seminar = await prisma.event.create({ data: { id: uuidv4(), title: 'Entrepreneurship & Startup Seminar', description: 'A full-day seminar featuring 6 successful startup founders, a panel on funding and scaling, and a pitching competition where students pitch ideas to real investors.', category: 'SEMINAR', status: 'PUBLISHED', venue: 'Seminar Hall 2, Block B', startDate: daysFromNow(10), endDate: daysFromNow(10), registrationDeadline: daysFromNow(8), maxCapacity: 200, currentRegistrations: 156, isTeamEvent: false, tags: ['startup', 'entrepreneurship', 'pitching'], createdById: admin.id } });
  console.log('✅ Events created: 11 events (completed, ongoing, upcoming)');

  // Registrations for Arjun
  const reg1 = await prisma.registration.create({ data: { id: uuidv4(), studentId: arjun.id, eventId: hackathon2024.id, status: 'ATTENDED', qrCode: uuidv4(), registeredAt: daysAgo(52), checkedInAt: daysAgo(45), teamName: 'Code Wizards', teamMembers: ['priya.nair@student.campusflow.app', 'rahul.mehta@student.campusflow.app'], feedback: 'Amazing experience! The mentors were super helpful and the problem statements were very relevant.', rating: 5 } });
  const reg2 = await prisma.registration.create({ data: { id: uuidv4(), studentId: arjun.id, eventId: workshop2024.id, status: 'ATTENDED', qrCode: uuidv4(), registeredAt: daysAgo(28), checkedInAt: daysAgo(20), feedback: 'Very hands-on and practical. Learned a lot about TensorFlow and neural networks.', rating: 4 } });
  const reg3 = await prisma.registration.create({ data: { id: uuidv4(), studentId: arjun.id, eventId: guestLecture2024.id, status: 'ATTENDED', qrCode: uuidv4(), registeredAt: daysAgo(14), checkedInAt: daysAgo(10), feedback: 'Great insights into Web3. Really changed my perspective on decentralized systems.', rating: 5 } });
  await prisma.registration.create({ data: { id: uuidv4(), studentId: arjun.id, eventId: sportsWeek.id, status: 'APPROVED', qrCode: uuidv4(), registeredAt: daysAgo(7), teamName: 'CS Warriors', teamMembers: ['priya.nair@student.campusflow.app', 'rahul.mehta@student.campusflow.app'] } });
  await prisma.registration.create({ data: { id: uuidv4(), studentId: arjun.id, eventId: codingContest.id, status: 'APPROVED', qrCode: uuidv4(), registeredAt: daysAgo(1) } });
  await prisma.registration.create({ data: { id: uuidv4(), studentId: arjun.id, eventId: techSprint2025.id, status: 'PENDING', qrCode: uuidv4(), registeredAt: new Date(), teamName: 'Neural Ninjas', teamMembers: ['priya.nair@student.campusflow.app'] } });

  // Other students
  const priyaHackReg = await prisma.registration.create({ data: { id: uuidv4(), studentId: priya.id, eventId: hackathon2024.id, status: 'ATTENDED', qrCode: uuidv4(), registeredAt: daysAgo(52), checkedInAt: daysAgo(45), teamName: 'Code Wizards', rating: 5 } });
  await prisma.registration.createMany({ data: [
    { id: uuidv4(), studentId: priya.id, eventId: culturalFest2024.id, status: 'ATTENDED', qrCode: uuidv4(), registeredAt: daysAgo(70), checkedInAt: daysAgo(60), rating: 4 },
    { id: uuidv4(), studentId: priya.id, eventId: designWorkshop.id, status: 'APPROVED', qrCode: uuidv4(), registeredAt: daysAgo(3) },
    { id: uuidv4(), studentId: rahul.id, eventId: sportsWeek.id, status: 'APPROVED', qrCode: uuidv4(), registeredAt: daysAgo(6) },
    { id: uuidv4(), studentId: rahul.id, eventId: culturalFest2024.id, status: 'ATTENDED', qrCode: uuidv4(), registeredAt: daysAgo(68), checkedInAt: daysAgo(60), rating: 5 },
    { id: uuidv4(), studentId: sneha.id, eventId: techSprint2025.id, status: 'PENDING', qrCode: uuidv4(), registeredAt: daysAgo(1) },
    { id: uuidv4(), studentId: sneha.id, eventId: seminar.id, status: 'APPROVED', qrCode: uuidv4(), registeredAt: daysAgo(2) },
    { id: uuidv4(), studentId: vikram.id, eventId: placementDrive.id, status: 'APPROVED', qrCode: uuidv4(), registeredAt: daysAgo(4) },
    { id: uuidv4(), studentId: vikram.id, eventId: codingContest.id, status: 'APPROVED', qrCode: uuidv4(), registeredAt: daysAgo(1) },
  ]});
  console.log('✅ Registrations created for all students');

  // Certificates for Arjun
  await prisma.certificate.create({ data: { id: uuidv4(), registrationId: reg1.id, studentId: arjun.id, eventId: hackathon2024.id, certificateNumber: 'CF-2024-HK9A2X', issuedAt: daysAgo(43) } });
  await prisma.certificate.create({ data: { id: uuidv4(), registrationId: reg2.id, studentId: arjun.id, eventId: workshop2024.id, certificateNumber: 'CF-2024-WS7M3P', issuedAt: daysAgo(18) } });
  await prisma.certificate.create({ data: { id: uuidv4(), registrationId: reg3.id, studentId: arjun.id, eventId: guestLecture2024.id, certificateNumber: 'CF-2024-GL4R8Q', issuedAt: daysAgo(9) } });
  // Certificate for Priya
  await prisma.certificate.create({ data: { id: uuidv4(), registrationId: priyaHackReg.id, studentId: priya.id, eventId: hackathon2024.id, certificateNumber: 'CF-2024-HK9B3Y', issuedAt: daysAgo(43) } });
  console.log('✅ Certificates created: 3 for Arjun, 1 for Priya');

  // Notifications
  await prisma.notification.createMany({ data: [
    { id: uuidv4(), userId: arjun.id, title: 'Certificate Ready!', message: 'Your certificate for HackIndia 2024 National Hackathon is ready. Download it from your certificates page.', type: 'CERTIFICATE_READY', isRead: true, createdAt: daysAgo(43) },
    { id: uuidv4(), userId: arjun.id, title: 'Certificate Ready!', message: 'Your certificate for AI & Machine Learning Workshop is ready to download.', type: 'CERTIFICATE_READY', isRead: true, createdAt: daysAgo(18) },
    { id: uuidv4(), userId: arjun.id, title: 'Certificate Ready!', message: 'Your certificate for Industry Talk: Future of Web3 & Blockchain is now available.', type: 'CERTIFICATE_READY', isRead: false, createdAt: daysAgo(9) },
    { id: uuidv4(), userId: arjun.id, title: 'Registration Approved!', message: 'Your registration for Code Wars — Competitive Programming has been approved. Your QR ticket is ready.', type: 'REGISTRATION_UPDATE', isRead: false, createdAt: daysAgo(1) },
    { id: uuidv4(), userId: arjun.id, title: 'Registration Pending', message: 'Your registration for TechSprint 2025 is pending approval. You will be notified once reviewed.', type: 'REGISTRATION_UPDATE', isRead: false, createdAt: new Date() },
    { id: uuidv4(), userId: arjun.id, title: 'New Event: UI/UX Design Bootcamp', message: 'A new workshop has been published — UI/UX Design Bootcamp. Only 9 spots remaining!', type: 'NEW_EVENT', isRead: false, createdAt: daysAgo(3) },
    { id: uuidv4(), userId: arjun.id, title: 'New Event: Entrepreneurship Seminar', message: 'Entrepreneurship & Startup Seminar is now open. Pitch your startup idea to real investors!', type: 'NEW_EVENT', isRead: true, createdAt: daysAgo(5) },
    { id: uuidv4(), userId: arjun.id, title: 'Sports Week Starts Tomorrow!', message: 'Inter-Department Sports Week kicks off tomorrow. Get ready to represent Computer Science!', type: 'EVENT_REMINDER', isRead: true, createdAt: daysAgo(3) },
    { id: uuidv4(), userId: arjun.id, title: 'Announcement', message: 'The central library will have reduced hours (9AM–2PM) during Sports Week until next Friday.', type: 'ANNOUNCEMENT', isRead: false, createdAt: daysAgo(2) },
    { id: uuidv4(), userId: priya.id, title: 'Certificate Ready!', message: 'Your certificate for HackIndia 2024 is ready to download.', type: 'CERTIFICATE_READY', isRead: false, createdAt: daysAgo(43) },
    { id: uuidv4(), userId: priya.id, title: 'Registration Approved!', message: 'Your registration for UI/UX Design Bootcamp has been approved.', type: 'REGISTRATION_UPDATE', isRead: false, createdAt: daysAgo(3) },
    { id: uuidv4(), userId: rahul.id, title: 'Registration Approved!', message: 'Your registration for Inter-Department Sports Week has been approved.', type: 'REGISTRATION_UPDATE', isRead: false, createdAt: daysAgo(6) },
    { id: uuidv4(), userId: admin.id, title: 'New Registrations', message: '12 new registrations received for TechSprint 2025 in the last 24 hours.', type: 'ANNOUNCEMENT', isRead: false, createdAt: new Date() },
    { id: uuidv4(), userId: admin.id, title: 'Sports Week Ongoing', message: 'Inter-Department Sports Week is currently ongoing. 487 students checked in so far.', type: 'ANNOUNCEMENT', isRead: true, createdAt: daysAgo(1) },
  ]});
  console.log('✅ Notifications created for all users');

  console.log('\n🎉 Seed completed successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:   admin@campusflow.app  /  Admin@123');
  console.log('Student: arjun.sharma@student.campusflow.app  /  Student@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
