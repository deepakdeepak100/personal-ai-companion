const https = require('https');
const { URL } = require('url');

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDiosUOyMAPm_RBUr0LQfp383Nwon_ykg8";

// 1. Fetch Models
function fetchModels() {
    return new Promise((resolve, reject) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(`Failed to fetch models: ${res.statusCode} ${data}`);
                } else {
                    try {
                        const json = JSON.parse(data);
                        resolve(json.models || []);
                    } catch (e) {
                        reject(e);
                    }
                }
            });
        }).on('error', reject);
    });
}

// 2. Test Generation
function testGeneration(modelName) {
    return new Promise((resolve) => {
        const url = new URL(`https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent`);
        url.searchParams.append('key', API_KEY);

        const req = https.request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve({ success: true, model: modelName });
                } else {
                    resolve({ success: false, model: modelName, error: res.statusCode });
                }
            });
        });

        req.on('error', () => resolve({ success: false, model: modelName, error: 'Network Error' }));
        req.write(JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] }));
        req.end();
    });
}

// Main
async function main() {
    console.log("Fetching available models...");
    try {
        const models = await fetchModels();
        // Filter for "generateContent" supported models
        const chatModels = models.filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"));

        console.log(`Found ${chatModels.length} candidate models:`);
        chatModels.forEach(m => console.log(` - ${m.name}`));

        console.log("\nTesting each model for free tier access...");

        for (const model of chatModels) {
            console.log(`Testing ${model.name}...`);
            const result = await testGeneration(model.name);
            if (result.success) {
                console.log(`\n🎉 SUCCESS! Working model found: ${model.name}`);
                console.log(`>>> PLEASE UPDATE CODE TO USE: ${model.name.replace('models/', '')}`);
                return;
            } else {
                console.log(`   Failed (${result.error})`);
            }
        }
        console.log("\n❌ ALL MODELS FAILED.");
    } catch (error) {
        console.error("Critical Error:", error);
    }
}

main();
