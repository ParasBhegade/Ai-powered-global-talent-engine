const { callGroq } = require('./utils/groq');
require('dotenv').config();

async function test() {
  try {
    console.log("Testing Groq...");
    const res = await callGroq([{ role: 'user', content: 'Say hello' }]);
    console.log("Response:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
