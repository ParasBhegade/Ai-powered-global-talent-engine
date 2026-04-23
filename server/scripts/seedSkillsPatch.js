/**
 * seedSkillsPatch.js — adds missing skills for Data Scientist, AI Prompt Engineer, IoT Engineer, Robotics Engineer
 * Run: node server/scripts/seedSkillsPatch.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const CareerPath = require('../models/CareerPath');
const Skill = require('../models/Skill');

const EXTRA_SKILLS = {
  'Data Scientist': [
    { skillName: 'Python (Pandas, Scikit-learn)', category: 'Language', weight: 95 },
    { skillName: 'Statistical Modeling', category: 'Math', weight: 90 },
    { skillName: 'Machine Learning', category: 'ML', weight: 92 },
    { skillName: 'Data Visualization (Seaborn, Plotly)', category: 'Visualization', weight: 82 },
    { skillName: 'SQL & Database Querying', category: 'Database', weight: 80 },
    { skillName: 'Feature Engineering', category: 'Data', weight: 85 },
    { skillName: 'Deep Learning (TensorFlow/Keras)', category: 'Deep Learning', weight: 78 },
    { skillName: 'Big Data (Spark, Hadoop)', category: 'Big Data', weight: 70 },
  ],
  'AI Prompt Engineer': [
    { skillName: 'Prompt Design & Engineering', category: 'AI', weight: 95 },
    { skillName: 'LLM Understanding (GPT, Claude)', category: 'AI', weight: 92 },
    { skillName: 'Python for AI Scripting', category: 'Language', weight: 80 },
    { skillName: 'Retrieval Augmented Generation (RAG)', category: 'AI', weight: 85 },
    { skillName: 'Fine-tuning & RLHF', category: 'AI', weight: 78 },
    { skillName: 'AI Ethics & Bias Mitigation', category: 'Ethics', weight: 72 },
    { skillName: 'API Integration (OpenAI, Groq)', category: 'API', weight: 88 },
    { skillName: 'Chain-of-Thought Techniques', category: 'AI', weight: 82 },
  ],
  'IoT Engineer': [
    { skillName: 'Embedded C / Python (MicroPython)', category: 'Language', weight: 92 },
    { skillName: 'IoT Protocols (MQTT, CoAP)', category: 'Protocols', weight: 90 },
    { skillName: 'Microcontrollers (ESP32, Raspberry Pi)', category: 'Hardware', weight: 88 },
    { skillName: 'Cloud IoT Platforms (AWS IoT, Azure IoT)', category: 'Cloud', weight: 80 },
    { skillName: 'Sensor Integration', category: 'Hardware', weight: 85 },
    { skillName: 'Edge Computing', category: 'Architecture', weight: 75 },
    { skillName: 'IoT Security', category: 'Security', weight: 78 },
    { skillName: 'Data Streaming & Analytics', category: 'Data', weight: 70 },
  ],
  'Robotics Engineer': [
    { skillName: 'ROS (Robot Operating System)', category: 'Framework', weight: 95 },
    { skillName: 'C++ / Python for Robotics', category: 'Language', weight: 92 },
    { skillName: 'Kinematics & Dynamics', category: 'Math', weight: 88 },
    { skillName: 'Computer Vision (OpenCV)', category: 'CV', weight: 85 },
    { skillName: 'Path Planning & SLAM', category: 'Algorithms', weight: 82 },
    { skillName: 'Sensor Fusion (LiDAR, IMU)', category: 'Hardware', weight: 80 },
    { skillName: 'Control Systems', category: 'Engineering', weight: 85 },
    { skillName: 'Simulation (Gazebo, RViz)', category: 'Tools', weight: 72 },
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

  for (const path of paths) {
    const skillsForPath = EXTRA_SKILLS[path.name];
    if (!skillsForPath) continue;

    const existing = await Skill.countDocuments({ careerPath: path._id });
    if (existing > 0) {
      console.log(`  Skills already exist for: ${path.name} (${existing}) — skipping`);
      continue;
    }

    const skillDocs = skillsForPath.map(s => ({ ...s, careerPath: path._id }));
    await Skill.insertMany(skillDocs);
    console.log(`  Added ${skillDocs.length} skills for: ${path.name}`);
  }

  console.log('Done!');
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
