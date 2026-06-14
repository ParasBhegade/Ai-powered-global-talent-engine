require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

const CareerPath = require('./models/CareerPath');
const Skill = require('./models/Skill');
const AptitudeQuestion = require('./models/AptitudeQuestion');
const Tutorial = require('./models/Tutorial');
const { embedText } = require('./utils/embeddings');

async function restore() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear collections
  await CareerPath.deleteMany({});
  await Skill.deleteMany({});
  await AptitudeQuestion.deleteMany({});
  await Tutorial.deleteMany({});
  console.log('Cleared existing data.');

  const sql = fs.readFileSync('../database/ai_talent_db.sql', 'utf8');

  // Parse Paths
  const pathsStr = sql.match(/INSERT INTO `career_paths`[\s\S]*?VALUES\s*([\s\S]+?);/)[1];
  const pathRegex = /\((\d+),\s*'([^']*)',\s*'([^']*)'\)/g;
  const sqlIdToPath = {};
  const mongoPaths = [];

  let pMatch;
  while ((pMatch = pathRegex.exec(pathsStr)) !== null) {
    const id = parseInt(pMatch[1]);
    const name = pMatch[2].replace(/\\'/g, "'");
    const description = pMatch[3].replace(/\\'/g, "'");

    const cp = new CareerPath({ name, description });
    await cp.save();
    sqlIdToPath[id] = cp;
    mongoPaths.push(cp);
  }
  console.log(`Restored ${mongoPaths.length} CareerPaths.`);

  // Parse Skills
  const skStrMatch = sql.match(/INSERT INTO `skills`[\s\S]*?VALUES\s*([\s\S]+?);/);
  if (skStrMatch) {
    const skRegex = /\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*(\d+)\)/g;
    let sMatch;
    let skillCount = 0;
    while ((sMatch = skRegex.exec(skStrMatch[1])) !== null) {
      const cpId = parseInt(sMatch[2]);
      const cp = sqlIdToPath[cpId];
      if (cp) {
        await Skill.create({
          careerPath: cp._id,
          skillName: sMatch[3].replace(/\\'/g, "'"),
          category: sMatch[4].replace(/\\'/g, "'"),
          weight: parseInt(sMatch[5]) * 20 // Convert 1-5 scale to 20-100 scale
        });
        skillCount++;
      }
    }
    console.log(`Restored ${skillCount} Skills.`);
  }

  // Generate Embeddings
  console.log('Generating embeddings for restored paths...');
  for (const cp of mongoPaths) {
    const skills = await Skill.find({ careerPath: cp._id });
    const skillNames = skills.map(s => s.skillName).join(', ');
    const textToEmbed = `Career: ${cp.name}. Description: ${cp.description}. Required Skills: ${skillNames}.`;
    cp.requirementsEmbedding = await embedText(textToEmbed);
    await cp.save();
  }
  console.log('Finished generating embeddings.');

  // Parse Tutorials
  const tutStrMatch = sql.match(/INSERT INTO `tutorials`[\s\S]*?VALUES\s*([\s\S]+?);/);
  if (tutStrMatch) {
    const tutRegex = /\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'\)/g;
    let tMatch;
    let tutCount = 0;
    while ((tMatch = tutRegex.exec(tutStrMatch[1])) !== null) {
      const cpId = parseInt(tMatch[2]);
      const cp = sqlIdToPath[cpId];
      if (cp) {
        await Tutorial.create({
          careerPath: cp._id,
          title: tMatch[3].replace(/\\'/g, "'"),
          url: tMatch[4].replace(/\\'/g, "'"),
          summary: tMatch[5].replace(/\\'/g, "'")
        });
        tutCount++;
      }
    }
    console.log(`Restored ${tutCount} Tutorials.`);
  }

  // Parse Aptitude Questions
  const qStrMatch = sql.match(/INSERT INTO `aptitude_questions`[\s\S]*?VALUES\s*([\s\S]+?);/);
  if (qStrMatch) {
    const qRegex = /\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'\)/g;
    let qMatch;
    let qCount = 0;
    while ((qMatch = qRegex.exec(qStrMatch[1])) !== null) {
      const cpId = parseInt(qMatch[2]);
      const cp = sqlIdToPath[cpId];
      if (cp) {
        await AptitudeQuestion.create({
          careerPath: cp._id,
          question: qMatch[3].replace(/\\'/g, "'"),
          optionA: qMatch[4].replace(/\\'/g, "'"),
          optionB: qMatch[5].replace(/\\'/g, "'"),
          optionC: qMatch[6].replace(/\\'/g, "'"),
          optionD: qMatch[7].replace(/\\'/g, "'"),
          correctOption: qMatch[8].replace(/\\'/g, "'")
        });
        qCount++;
      }
    }
    console.log(`Restored ${qCount} Aptitude Questions.`);
  }

  console.log('🎉 Data successfully restored!');
  process.exit(0);
}

restore().catch(err => {
  console.error('Error during restore:', err);
  process.exit(1);
});
