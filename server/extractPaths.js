const fs = require('fs');
const sql = fs.readFileSync('d:/projects/AI-Talent-Recommendation/database/ai_talent_db.sql', 'utf8');

function parseTable(tableName) {
  const regex = new RegExp(`INSERT INTO \\\`${tableName}\\\`[\\s\\S]*?VALUES\\s*([\\s\\S]+?);`);
  const match = sql.match(regex);
  if (!match) return [];
  
  const rawValues = match[1];
  // split by ),\n or ), 
  // We can use a simple state machine to parse the rows securely
  const rows = [];
  let inString = false;
  let currentRow = [];
  let currentVal = '';
  
  for(let i=0; i<rawValues.length; i++) {
    const char = rawValues[i];
    
    if (char === "'" && rawValues[i-1] !== '\\') {
      inString = !inString;
      // keep the quote so we know it's a string later, or discard it
    }
    
    if (!inString) {
      if (char === '(' && currentVal.trim() === '') {
        currentRow = [];
        currentVal = '';
        continue;
      }
      if (char === ',' && rawValues[i+1] !== '\n') { // basic split
        // handle next
      }
    }
  }
}

// A simpler regex approach since we know the schema:
// For career_paths:
const pathsStr = sql.match(/INSERT INTO `career_paths`[\s\S]*?VALUES\s*([\s\S]+?);/)[1];
const pathRegex = /\((\d+),\s*'([^']*)',\s*'([^']*)'\)/g;
let pMatch;
const paths = [];
while ((pMatch = pathRegex.exec(pathsStr)) !== null) {
  paths.push({ id: parseInt(pMatch[1]), name: pMatch[2].replace(/\\'/g, "'"), description: pMatch[3].replace(/\\'/g, "'") });
}
console.log(`Found ${paths.length} paths`);

// For tutorials
const tutStrMatch = sql.match(/INSERT INTO `tutorials`[\s\S]*?VALUES\s*([\s\S]+?);/);
if (tutStrMatch) {
  const tutStr = tutStrMatch[1];
  const tutRegex = /\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'\)/g;
  const tuts = [];
  let tMatch;
  while ((tMatch = tutRegex.exec(tutStr)) !== null) {
    tuts.push({ cp_id: parseInt(tMatch[2]), title: tMatch[3], url: tMatch[4] });
  }
  console.log(`Found ${tuts.length} tutorials`);
}

// For aptitude_questions
const qStrMatch = sql.match(/INSERT INTO `aptitude_questions`[\s\S]*?VALUES\s*([\s\S]+?);/);
if(qStrMatch) {
    const qStr = qStrMatch[1];
    const qRegex = /\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'\)/g;
    let count = 0;
    let m;
    while((m = qRegex.exec(qStr)) !== null) { count++; }
    console.log(`Found ${count} aptitude_questions`);
}

// For skills
const skStrMatch = sql.match(/INSERT INTO `skills`[\s\S]*?VALUES\s*([\s\S]+?);/);
if (skStrMatch) {
    const skStr = skStrMatch[1];
    const skRegex = /\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*(\d+)\)/g;
    let count = 0;
    let m;
    while((m = skRegex.exec(skStr)) !== null) { count++; }
    console.log(`Found ${count} skills`);
}
