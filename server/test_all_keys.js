require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testKeys() {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4
  ];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    console.log(`\n--- Testing Key ${i + 1} ---`);
    if (!key) {
      console.log(`Key ${i + 1} is missing.`);
      continue;
    }
    console.log(`Key begins with: ${key.substring(0, 10)}...`);
    
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent("Say 'hello world'");
      console.log(`SUCCESS: ${(await result.response).text().trim()}`);
    } catch (e) {
      console.log(`FAILED: ${e.message}`);
    }
  }
}

testKeys();
