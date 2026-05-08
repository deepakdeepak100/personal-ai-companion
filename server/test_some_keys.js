require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function testKeys() {
  const keys = [
    { name: 'Key 3', val: process.env.GEMINI_API_KEY_3 },
    { name: 'Key 4', val: process.env.GEMINI_API_KEY_4 }
  ];
  let output = '';

  for (const k of keys) {
    output += `\n--- Testing ${k.name} ---\n`;
    if (!k.val) {
      output += `${k.name} is missing in .env.\n`;
      continue;
    }
    output += `Starts with: ${k.val.substring(0, 10)}...\n`;
    try {
      const genAI = new GoogleGenerativeAI(k.val);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent("Hello?");
      output += `SUCCESS: ${(await result.response).text().trim()}\n`;
    } catch (e) {
      output += `FAILED: ${e.message}\n`;
    }
  }
  fs.writeFileSync('key_debug.txt', output, 'utf-8');
  console.log("Done checking keys. Output saved to key_debug.txt.");
}

testKeys();
