/**
 * Seed script — populates MongoDB with career paths, skills, aptitude questions, tutorials, and an admin user.
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const CareerPath = require('./models/CareerPath');
const Skill = require('./models/Skill');
const AptitudeQuestion = require('./models/AptitudeQuestion');
const Tutorial = require('./models/Tutorial');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000
  });
  console.log('Connected to MongoDB');
  // Clear existing data
  try {
    console.log('Clearing Users...');
    await User.deleteMany({});
    console.log('Clearing CareerPaths...');
    await CareerPath.deleteMany({});
    console.log('Clearing Skills...');
    await Skill.deleteMany({});
    console.log('Clearing Questions...');
    await AptitudeQuestion.deleteMany({});
    console.log('Clearing Tutorials...');
    await Tutorial.deleteMany({});
    console.log('Successfully cleared all collections.');
  } catch (err) {
    console.error('Error clearing data:', err);
    throw err;
  }

  // ========== Admin User ==========
  try {
    console.log('Creating Admin User...');
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@aitalent.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('✅ Admin user created:', admin.email);
  } catch (err) {
    console.error('Error creating Admin user:', JSON.stringify(err, null, 2) || err.message);
    throw err;
  }

  // ========== Career Paths ==========
  const paths = [
    { name: 'Web Developer', description: 'Build modern web applications using HTML, CSS, JavaScript and frameworks like React, Angular.' },
    { name: 'Backend Developer', description: 'Server-side programming with Node.js, Python, PHP. Build APIs, databases, and authentication systems.' },
    { name: 'Full Stack Developer', description: 'End-to-end web development covering both frontend and backend technologies.' },
    { name: 'Data Analyst', description: 'Analyze data using Excel, SQL, Python, Power BI and Tableau to extract business insights.' },
    { name: 'AI & ML Engineer', description: 'Build intelligent systems using machine learning, deep learning, TensorFlow and PyTorch.' },
    { name: 'Cyber Security Specialist', description: 'Protect systems from threats using ethical hacking, penetration testing, and security auditing.' },
    { name: 'Software Engineer', description: 'Design and build robust software systems with strong fundamentals in DSA and system design.' },
    { name: 'Mobile App Developer', description: 'Create mobile applications for Android and iOS using React Native, Flutter, or native development.' },
    { name: 'UI/UX Designer', description: 'Design user interfaces and experiences using Figma, wireframing, prototyping and design principles.' },
    { name: 'DevOps Engineer', description: 'Automate deployment pipelines with Docker, Kubernetes, CI/CD, and cloud infrastructure.' }
  ];

  const createdPaths = await CareerPath.insertMany(paths);
  console.log(`✅ ${createdPaths.length} career paths created`);

  // ========== Skills per path ==========
  const skillsData = {
    'Web Developer': [
      { skillName: 'HTML & CSS', category: 'Frontend', weight: 90 },
      { skillName: 'JavaScript', category: 'Frontend', weight: 95 },
      { skillName: 'React.js', category: 'Framework', weight: 85 },
      { skillName: 'Responsive Design', category: 'Frontend', weight: 80 },
      { skillName: 'DOM Manipulation', category: 'Frontend', weight: 70 },
      { skillName: 'REST APIs', category: 'Integration', weight: 75 },
      { skillName: 'Git & GitHub', category: 'Tools', weight: 70 },
      { skillName: 'Debugging', category: 'Skills', weight: 65 }
    ],
    'Backend Developer': [
      { skillName: 'Node.js', category: 'Runtime', weight: 90 },
      { skillName: 'Express.js', category: 'Framework', weight: 85 },
      { skillName: 'SQL & NoSQL', category: 'Database', weight: 88 },
      { skillName: 'REST API Design', category: 'Architecture', weight: 85 },
      { skillName: 'Authentication', category: 'Security', weight: 80 },
      { skillName: 'Python', category: 'Language', weight: 75 },
      { skillName: 'Server Management', category: 'DevOps', weight: 65 }
    ],
    'Full Stack Developer': [
      { skillName: 'HTML/CSS/JS', category: 'Frontend', weight: 90 },
      { skillName: 'React', category: 'Frontend', weight: 85 },
      { skillName: 'Node.js + Express', category: 'Backend', weight: 90 },
      { skillName: 'MongoDB', category: 'Database', weight: 80 },
      { skillName: 'REST APIs', category: 'Architecture', weight: 85 },
      { skillName: 'Git', category: 'Tools', weight: 75 },
      { skillName: 'Deployment', category: 'DevOps', weight: 70 }
    ],
    'Data Analyst': [
      { skillName: 'Excel', category: 'Tools', weight: 85 },
      { skillName: 'SQL', category: 'Database', weight: 90 },
      { skillName: 'Python (Pandas)', category: 'Programming', weight: 80 },
      { skillName: 'Power BI', category: 'Visualization', weight: 75 },
      { skillName: 'Tableau', category: 'Visualization', weight: 70 },
      { skillName: 'Data Cleaning', category: 'Skills', weight: 85 },
      { skillName: 'Statistics', category: 'Theory', weight: 75 }
    ],
    'AI & ML Engineer': [
      { skillName: 'Python', category: 'Language', weight: 95 },
      { skillName: 'Machine Learning', category: 'Core', weight: 90 },
      { skillName: 'Deep Learning', category: 'Core', weight: 85 },
      { skillName: 'TensorFlow', category: 'Framework', weight: 80 },
      { skillName: 'PyTorch', category: 'Framework', weight: 78 },
      { skillName: 'Data Processing', category: 'Skills', weight: 75 },
      { skillName: 'Model Evaluation', category: 'Skills', weight: 70 }
    ],
    'Cyber Security Specialist': [
      { skillName: 'Ethical Hacking', category: 'Core', weight: 90 },
      { skillName: 'Penetration Testing', category: 'Core', weight: 88 },
      { skillName: 'OWASP Top 10', category: 'Knowledge', weight: 85 },
      { skillName: 'Network Security', category: 'Networking', weight: 80 },
      { skillName: 'Vulnerability Assessment', category: 'Skills', weight: 82 },
      { skillName: 'Cryptography', category: 'Theory', weight: 70 }
    ],
    'Software Engineer': [
      { skillName: 'Data Structures', category: 'Core', weight: 95 },
      { skillName: 'Algorithms', category: 'Core', weight: 90 },
      { skillName: 'OOP', category: 'Paradigm', weight: 85 },
      { skillName: 'System Design', category: 'Architecture', weight: 82 },
      { skillName: 'Problem Solving', category: 'Skills', weight: 90 },
      { skillName: 'Code Reviews', category: 'Practices', weight: 65 }
    ],
    'Mobile App Developer': [
      { skillName: 'React Native', category: 'Framework', weight: 85 },
      { skillName: 'Flutter', category: 'Framework', weight: 80 },
      { skillName: 'Android (Kotlin)', category: 'Native', weight: 75 },
      { skillName: 'iOS (Swift)', category: 'Native', weight: 70 },
      { skillName: 'Mobile UI/UX', category: 'Design', weight: 80 },
      { skillName: 'API Integration', category: 'Skills', weight: 75 }
    ],
    'UI/UX Designer': [
      { skillName: 'Figma', category: 'Tools', weight: 90 },
      { skillName: 'Wireframing', category: 'Process', weight: 85 },
      { skillName: 'Prototyping', category: 'Process', weight: 80 },
      { skillName: 'Design Systems', category: 'Theory', weight: 75 },
      { skillName: 'User Research', category: 'Research', weight: 78 },
      { skillName: 'Color Theory', category: 'Theory', weight: 65 }
    ],
    'DevOps Engineer': [
      { skillName: 'Docker', category: 'Containers', weight: 90 },
      { skillName: 'Kubernetes', category: 'Orchestration', weight: 85 },
      { skillName: 'CI/CD Pipelines', category: 'Automation', weight: 88 },
      { skillName: 'AWS/Azure/GCP', category: 'Cloud', weight: 82 },
      { skillName: 'Linux', category: 'OS', weight: 80 },
      { skillName: 'Monitoring', category: 'Observability', weight: 70 }
    ]
  };

  let skillCount = 0;
  for (const cp of createdPaths) {
    const pathSkills = skillsData[cp.name];
    if (pathSkills) {
      const docs = pathSkills.map(s => ({ ...s, careerPath: cp._id }));
      await Skill.insertMany(docs);
      skillCount += docs.length;
    }
  }
  console.log(`✅ ${skillCount} skills created`);

  // ========== Aptitude Questions (sample — 5 per path for first 3 paths) ==========
  const sampleQuestions = {
    'Web Developer': [
      { question: 'What does HTML stand for?', optionA: 'Hyper Text Markup Language', optionB: 'High Tech Modern Language', optionC: 'Hyper Transfer Markup Language', optionD: 'Home Tool Markup Language', correctOption: 'A' },
      { question: 'Which CSS property is used to change text color?', optionA: 'font-color', optionB: 'text-color', optionC: 'color', optionD: 'background-color', correctOption: 'C' },
      { question: 'What is the correct way to declare a JavaScript variable?', optionA: 'variable x;', optionB: 'var x;', optionC: 'v x;', optionD: 'declare x;', correctOption: 'B' },
      { question: 'Which tag is used to create a hyperlink in HTML?', optionA: '<link>', optionB: '<a>', optionC: '<href>', optionD: '<url>', correctOption: 'B' },
      { question: 'What does CSS stand for?', optionA: 'Creative Style Sheets', optionB: 'Computer Style Sheets', optionC: 'Cascading Style Sheets', optionD: 'Colorful Style Sheets', correctOption: 'C' }
    ],
    'Backend Developer': [
      { question: 'What is Node.js?', optionA: 'A frontend framework', optionB: 'A JavaScript runtime', optionC: 'A database', optionD: 'A CSS preprocessor', correctOption: 'B' },
      { question: 'What does REST stand for?', optionA: 'Representational State Transfer', optionB: 'Remote State Transfer', optionC: 'Rapid Execution Server Technology', optionD: 'Resource State Transformation', correctOption: 'A' },
      { question: 'Which HTTP method is used to update data?', optionA: 'GET', optionB: 'POST', optionC: 'PUT', optionD: 'DELETE', correctOption: 'C' },
      { question: 'What is MongoDB?', optionA: 'Relational database', optionB: 'NoSQL database', optionC: 'Graph database only', optionD: 'File system', correctOption: 'B' },
      { question: 'What is middleware in Express.js?', optionA: 'A database layer', optionB: 'Functions that execute during request-response cycle', optionC: 'A frontend component', optionD: 'A CSS framework', correctOption: 'B' }
    ],
    'Software Engineer': [
      { question: 'What is the time complexity of binary search?', optionA: 'O(n)', optionB: 'O(log n)', optionC: 'O(n²)', optionD: 'O(1)', correctOption: 'B' },
      { question: 'What does OOP stand for?', optionA: 'Object Oriented Programming', optionB: 'Open Operation Protocol', optionC: 'Ordered Object Processing', optionD: 'Output Oriented Programming', correctOption: 'A' },
      { question: 'Which data structure uses FIFO?', optionA: 'Stack', optionB: 'Queue', optionC: 'Tree', optionD: 'Graph', correctOption: 'B' },
      { question: 'What is polymorphism?', optionA: 'Single inheritance', optionB: 'Multiple data types', optionC: 'Objects taking many forms', optionD: 'Database normalization', correctOption: 'C' },
      { question: 'What is the worst-case complexity of quicksort?', optionA: 'O(n log n)', optionB: 'O(n)', optionC: 'O(n²)', optionD: 'O(log n)', correctOption: 'C' }
    ]
  };

  let qCount = 0;
  for (const cp of createdPaths) {
    const qs = sampleQuestions[cp.name];
    if (qs) {
      const docs = qs.map(q => ({ ...q, careerPath: cp._id }));
      await AptitudeQuestion.insertMany(docs);
      qCount += docs.length;
    }
  }
  console.log(`✅ ${qCount} aptitude questions created`);

  // ========== Tutorials (sample) ==========
  const webPath = createdPaths.find(p => p.name === 'Web Developer');
  const backendPath = createdPaths.find(p => p.name === 'Backend Developer');
  const softwarePath = createdPaths.find(p => p.name === 'Software Engineer');

  const tutorials = [
    { careerPath: webPath._id, title: 'HTML Crash Course', url: 'https://www.youtube.com/watch?v=UB1O30fR-EE', summary: 'Learn HTML basics in one hour.' },
    { careerPath: webPath._id, title: 'CSS Flexbox Tutorial', url: 'https://www.youtube.com/watch?v=JJSoEo8JSnc', summary: 'Master CSS Flexbox layout system.' },
    { careerPath: webPath._id, title: 'JavaScript ES6 Basics', url: 'https://www.youtube.com/watch?v=NCwa_xi0Uuc', summary: 'Modern JavaScript features explained.' },
    { careerPath: backendPath._id, title: 'Node.js Crash Course', url: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4', summary: 'Build your first Node.js server.' },
    { careerPath: backendPath._id, title: 'Express.js Tutorial', url: 'https://www.youtube.com/watch?v=SccSCuHhOw0', summary: 'Build REST APIs with Express.' },
    { careerPath: softwarePath._id, title: 'DSA Roadmap', url: 'https://www.youtube.com/watch?v=rZ41y93P2Qo', summary: 'Data structures and algorithms roadmap.' }
  ];

  await Tutorial.insertMany(tutorials);
  console.log(`✅ ${tutorials.length} tutorials created`);

  console.log('\n🎉 Seed complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
