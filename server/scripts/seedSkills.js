/**
 * seedSkills.js — adds skills to all 20 career paths
 * Run: node server/scripts/seedSkills.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const CareerPath = require('../models/CareerPath');
const Skill = require('../models/Skill');

// Full skills data for all 20 career paths (from old project reference)
const SKILLS_DATA = {
  'Web Developer': [
    { skillName: 'HTML5 & CSS3', category: 'Frontend', weight: 90 },
    { skillName: 'JavaScript (ES6+)', category: 'Frontend', weight: 95 },
    { skillName: 'Responsive Design', category: 'Frontend', weight: 80 },
    { skillName: 'React.js / Vue.js', category: 'Framework', weight: 85 },
    { skillName: 'Git & Version Control', category: 'Tools', weight: 75 },
    { skillName: 'REST APIs', category: 'Backend', weight: 70 },
    { skillName: 'CSS Frameworks (Bootstrap/Tailwind)', category: 'Frontend', weight: 65 },
    { skillName: 'Web Performance Optimization', category: 'Frontend', weight: 60 },
  ],
  'Backend Developer': [
    { skillName: 'Node.js / Python / Java', category: 'Language', weight: 95 },
    { skillName: 'REST API Design', category: 'Architecture', weight: 90 },
    { skillName: 'Database Management (SQL/NoSQL)', category: 'Database', weight: 88 },
    { skillName: 'Authentication & Authorization', category: 'Security', weight: 80 },
    { skillName: 'Server Management & Deployment', category: 'DevOps', weight: 70 },
    { skillName: 'Caching (Redis)', category: 'Performance', weight: 65 },
    { skillName: 'Message Queues (RabbitMQ/Kafka)', category: 'Architecture', weight: 60 },
    { skillName: 'API Testing', category: 'Quality', weight: 55 },
  ],
  'Full Stack Developer': [
    { skillName: 'React.js (Frontend)', category: 'Frontend', weight: 90 },
    { skillName: 'Node.js + Express (Backend)', category: 'Backend', weight: 90 },
    { skillName: 'MongoDB / PostgreSQL', category: 'Database', weight: 85 },
    { skillName: 'REST API & GraphQL', category: 'API', weight: 80 },
    { skillName: 'Authentication (JWT/OAuth)', category: 'Security', weight: 75 },
    { skillName: 'Docker & CI/CD', category: 'DevOps', weight: 65 },
    { skillName: 'TypeScript', category: 'Language', weight: 70 },
    { skillName: 'Testing (Jest/Cypress)', category: 'Quality', weight: 60 },
  ],
  'Data Analyst': [
    { skillName: 'Python (Pandas, NumPy)', category: 'Language', weight: 95 },
    { skillName: 'SQL & Database Querying', category: 'Database', weight: 90 },
    { skillName: 'Data Visualization (Matplotlib, Tableau)', category: 'Visualization', weight: 85 },
    { skillName: 'Excel & Google Sheets', category: 'Tools', weight: 75 },
    { skillName: 'Statistics & Probability', category: 'Math', weight: 80 },
    { skillName: 'Machine Learning Basics', category: 'ML', weight: 65 },
    { skillName: 'Power BI / Looker', category: 'BI Tools', weight: 70 },
    { skillName: 'Data Cleaning & Preprocessing', category: 'Data', weight: 88 },
  ],
  'AI & ML Engineer': [
    { skillName: 'Python & ML Libraries (TensorFlow/PyTorch)', category: 'Language', weight: 95 },
    { skillName: 'Machine Learning Algorithms', category: 'Algorithms', weight: 92 },
    { skillName: 'Deep Learning & Neural Networks', category: 'Deep Learning', weight: 88 },
    { skillName: 'Natural Language Processing', category: 'NLP', weight: 80 },
    { skillName: 'Computer Vision', category: 'CV', weight: 75 },
    { skillName: 'Data Preprocessing & Feature Engineering', category: 'Data', weight: 85 },
    { skillName: 'Model Deployment (MLOps)', category: 'Deployment', weight: 70 },
    { skillName: 'Statistics & Linear Algebra', category: 'Math', weight: 82 },
  ],
  'Cyber Security Specialist': [
    { skillName: 'Network Security & Protocols', category: 'Network', weight: 92 },
    { skillName: 'Ethical Hacking & Penetration Testing', category: 'Security', weight: 90 },
    { skillName: 'Cryptography', category: 'Security', weight: 85 },
    { skillName: 'SIEM & Log Analysis', category: 'Tools', weight: 78 },
    { skillName: 'Incident Response', category: 'Operations', weight: 80 },
    { skillName: 'Vulnerability Assessment', category: 'Security', weight: 88 },
    { skillName: 'Firewalls & IDS/IPS', category: 'Network', weight: 75 },
    { skillName: 'Compliance (GDPR, ISO 27001)', category: 'Compliance', weight: 65 },
  ],
  'Software Engineer': [
    { skillName: 'Data Structures & Algorithms', category: 'CS Fundamentals', weight: 95 },
    { skillName: 'Object-Oriented Programming', category: 'Design', weight: 90 },
    { skillName: 'System Design & Architecture', category: 'Architecture', weight: 85 },
    { skillName: 'Design Patterns', category: 'Design', weight: 80 },
    { skillName: 'Testing & TDD', category: 'Quality', weight: 75 },
    { skillName: 'Git & Agile Workflow', category: 'Tools', weight: 78 },
    { skillName: 'Operating Systems Concepts', category: 'CS Fundamentals', weight: 70 },
    { skillName: 'Debugging & Profiling', category: 'Tools', weight: 72 },
  ],
  'UI/UX Designer': [
    { skillName: 'Figma / Adobe XD', category: 'Tools', weight: 95 },
    { skillName: 'User Research & Personas', category: 'Research', weight: 88 },
    { skillName: 'Wireframing & Prototyping', category: 'Design', weight: 90 },
    { skillName: 'Color Theory & Typography', category: 'Design', weight: 85 },
    { skillName: 'Usability Testing', category: 'Research', weight: 82 },
    { skillName: 'Interaction Design', category: 'Design', weight: 80 },
    { skillName: 'CSS & HTML Basics', category: 'Frontend', weight: 65 },
    { skillName: 'Accessibility (WCAG)', category: 'Standards', weight: 72 },
  ],
  'QA Tester': [
    { skillName: 'Manual Testing Techniques', category: 'Testing', weight: 92 },
    { skillName: 'Selenium / Cypress (Automation)', category: 'Automation', weight: 85 },
    { skillName: 'Test Case Design & Documentation', category: 'Documentation', weight: 88 },
    { skillName: 'Bug Tracking (Jira, Bugzilla)', category: 'Tools', weight: 80 },
    { skillName: 'Performance Testing (JMeter)', category: 'Testing', weight: 72 },
    { skillName: 'API Testing (Postman)', category: 'API', weight: 78 },
    { skillName: 'Agile & Scrum', category: 'Process', weight: 75 },
    { skillName: 'SQL for Testers', category: 'Database', weight: 65 },
  ],
  'Mobile App Developer': [
    { skillName: 'React Native / Flutter', category: 'Framework', weight: 92 },
    { skillName: 'iOS (Swift) / Android (Kotlin)', category: 'Native', weight: 88 },
    { skillName: 'Mobile UI/UX Principles', category: 'Design', weight: 80 },
    { skillName: 'REST API Integration', category: 'API', weight: 82 },
    { skillName: 'State Management (Redux/Bloc)', category: 'Architecture', weight: 75 },
    { skillName: 'Push Notifications & Firebase', category: 'Services', weight: 70 },
    { skillName: 'App Store Deployment', category: 'DevOps', weight: 65 },
    { skillName: 'Performance Optimization', category: 'Performance', weight: 72 },
  ],
  'Cloud Engineer': [
    { skillName: 'AWS / Azure / GCP', category: 'Cloud', weight: 95 },
    { skillName: 'Infrastructure as Code (Terraform)', category: 'IaC', weight: 88 },
    { skillName: 'Kubernetes & Container Orchestration', category: 'Containers', weight: 85 },
    { skillName: 'Networking & VPCs', category: 'Network', weight: 80 },
    { skillName: 'CI/CD Pipelines', category: 'DevOps', weight: 82 },
    { skillName: 'Cloud Security & IAM', category: 'Security', weight: 78 },
    { skillName: 'Serverless Architecture', category: 'Architecture', weight: 72 },
    { skillName: 'Cost Optimization', category: 'Cloud', weight: 65 },
  ],
  'DevOps Engineer': [
    { skillName: 'Docker & Containerization', category: 'Containers', weight: 95 },
    { skillName: 'Kubernetes', category: 'Orchestration', weight: 90 },
    { skillName: 'CI/CD (Jenkins, GitHub Actions)', category: 'Automation', weight: 92 },
    { skillName: 'Linux & Shell Scripting', category: 'OS', weight: 85 },
    { skillName: 'Terraform / Ansible', category: 'IaC', weight: 82 },
    { skillName: 'Monitoring (Prometheus, Grafana)', category: 'Monitoring', weight: 78 },
    { skillName: 'Git & GitOps', category: 'Tools', weight: 80 },
    { skillName: 'Cloud Platforms (AWS/GCP)', category: 'Cloud', weight: 75 },
  ],
  'Database Administrator': [
    { skillName: 'SQL (PostgreSQL, MySQL)', category: 'Database', weight: 95 },
    { skillName: 'Database Design & Normalization', category: 'Design', weight: 92 },
    { skillName: 'Query Optimization & Indexing', category: 'Performance', weight: 88 },
    { skillName: 'Backup & Recovery', category: 'Operations', weight: 85 },
    { skillName: 'NoSQL (MongoDB, Redis)', category: 'Database', weight: 75 },
    { skillName: 'Replication & Clustering', category: 'Architecture', weight: 80 },
    { skillName: 'Database Security', category: 'Security', weight: 78 },
    { skillName: 'ETL Processes', category: 'Data', weight: 70 },
  ],
  'Network Engineer': [
    { skillName: 'TCP/IP & Networking Protocols', category: 'Protocols', weight: 95 },
    { skillName: 'Routing & Switching (CCNA level)', category: 'Network', weight: 92 },
    { skillName: 'Firewalls & VPNs', category: 'Security', weight: 88 },
    { skillName: 'Network Monitoring Tools', category: 'Tools', weight: 80 },
    { skillName: 'Wireless Networking (WiFi)', category: 'Network', weight: 75 },
    { skillName: 'DNS & DHCP', category: 'Services', weight: 78 },
    { skillName: 'Network Troubleshooting', category: 'Operations', weight: 85 },
    { skillName: 'SDN & Network Automation', category: 'Automation', weight: 65 },
  ],
  'System Administrator': [
    { skillName: 'Linux System Administration', category: 'OS', weight: 95 },
    { skillName: 'Windows Server', category: 'OS', weight: 88 },
    { skillName: 'Shell Scripting (Bash/PowerShell)', category: 'Scripting', weight: 85 },
    { skillName: 'Active Directory & LDAP', category: 'Directory', weight: 80 },
    { skillName: 'Virtualization (VMware/Hyper-V)', category: 'Virtualization', weight: 78 },
    { skillName: 'Backup & Disaster Recovery', category: 'Operations', weight: 82 },
    { skillName: 'Network Configuration', category: 'Network', weight: 75 },
    { skillName: 'Security Hardening', category: 'Security', weight: 72 },
  ],
  'Game Developer': [
    { skillName: 'Unity / Unreal Engine', category: 'Engine', weight: 95 },
    { skillName: 'C# / C++ Programming', category: 'Language', weight: 92 },
    { skillName: 'Game Physics & Math', category: 'CS Fundamentals', weight: 85 },
    { skillName: '3D Modeling Basics (Blender)', category: 'Art', weight: 70 },
    { skillName: 'Game Design Principles', category: 'Design', weight: 80 },
    { skillName: 'Shader Programming', category: 'Graphics', weight: 72 },
    { skillName: 'Multiplayer & Networking', category: 'Network', weight: 75 },
    { skillName: 'Performance Optimization', category: 'Performance', weight: 78 },
  ],
  'Blockchain Developer': [
    { skillName: 'Solidity & Smart Contracts', category: 'Language', weight: 95 },
    { skillName: 'Ethereum & Web3.js', category: 'Platform', weight: 90 },
    { skillName: 'Decentralized App (DApp) Development', category: 'Architecture', weight: 88 },
    { skillName: 'Cryptography Fundamentals', category: 'Security', weight: 82 },
    { skillName: 'Consensus Mechanisms', category: 'Blockchain', weight: 78 },
    { skillName: 'NFT & DeFi Protocols', category: 'Blockchain', weight: 72 },
    { skillName: 'Node.js with Blockchain APIs', category: 'Backend', weight: 75 },
    { skillName: 'Security Auditing for Smart Contracts', category: 'Security', weight: 80 },
  ],
  'Embedded Systems Engineer': [
    { skillName: 'C / C++ for Embedded Systems', category: 'Language', weight: 95 },
    { skillName: 'Microcontrollers (Arduino, STM32)', category: 'Hardware', weight: 92 },
    { skillName: 'RTOS (Real-Time Operating Systems)', category: 'OS', weight: 85 },
    { skillName: 'Embedded Linux', category: 'OS', weight: 80 },
    { skillName: 'Communication Protocols (I2C, SPI, UART)', category: 'Protocols', weight: 88 },
    { skillName: 'Hardware Debugging & Oscilloscope', category: 'Tools', weight: 78 },
    { skillName: 'Power Management', category: 'Hardware', weight: 70 },
    { skillName: 'PCB Design Basics', category: 'Hardware', weight: 65 },
  ],
  'AR/VR Developer': [
    { skillName: 'Unity 3D / Unreal Engine (XR)', category: 'Engine', weight: 95 },
    { skillName: 'C# / C++ Programming', category: 'Language', weight: 88 },
    { skillName: '3D Mathematics (Quaternions, Matrices)', category: 'Math', weight: 85 },
    { skillName: 'Spatial UI/UX Design', category: 'Design', weight: 82 },
    { skillName: 'ARKit / ARCore', category: 'SDK', weight: 88 },
    { skillName: 'VR Hardware (Oculus, HoloLens)', category: 'Hardware', weight: 78 },
    { skillName: 'Performance Optimization for XR', category: 'Performance', weight: 80 },
    { skillName: 'Shader & Graphics Programming', category: 'Graphics', weight: 72 },
  ],
  'Product Manager': [
    { skillName: 'Product Strategy & Roadmapping', category: 'Strategy', weight: 95 },
    { skillName: 'Agile & Scrum Methodology', category: 'Process', weight: 90 },
    { skillName: 'User Research & Market Analysis', category: 'Research', weight: 88 },
    { skillName: 'Data-Driven Decision Making', category: 'Analytics', weight: 85 },
    { skillName: 'Stakeholder Communication', category: 'Soft Skills', weight: 82 },
    { skillName: 'Wireframing & Prototyping', category: 'Design', weight: 75 },
    { skillName: 'A/B Testing & Metrics', category: 'Analytics', weight: 80 },
    { skillName: 'Go-To-Market Strategy', category: 'Strategy', weight: 78 },
  ],
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-talent');
  console.log('Connected to MongoDB');

  const paths = await CareerPath.find({});
  console.log(`Found ${paths.length} career paths`);

  let added = 0, skipped = 0;

  for (const path of paths) {
    const skillsForPath = SKILLS_DATA[path.name];
    if (!skillsForPath) {
      console.log(`  No skill data for: ${path.name}`);
      continue;
    }

    // Check if skills already exist
    const existing = await Skill.countDocuments({ careerPath: path._id });
    if (existing > 0) {
      console.log(`  Skills already exist for: ${path.name} (${existing} skills) — skipping`);
      skipped++;
      continue;
    }

    // Add skills
    const skillDocs = skillsForPath.map(s => ({ ...s, careerPath: path._id }));
    await Skill.insertMany(skillDocs);
    console.log(`  Added ${skillDocs.length} skills for: ${path.name}`);
    added++;
  }

  console.log(`\nDone! Added skills for ${added} paths, skipped ${skipped} (already had skills).`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
