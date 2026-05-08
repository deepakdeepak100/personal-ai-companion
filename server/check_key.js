const dotenv = require("dotenv");
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function testConnection() {
    const model = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

    console.log(`Testing URL: https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "Hello, are you working?"
                    }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            console.error("Error Detail:", JSON.stringify(data, null, 2));
        } else {
            console.log("SUCCESS! API is working.");
            console.log("Response:", data.candidates[0].content.parts[0].text);
        }

    } catch (error) {
        console.error("Network Error:", error);
    }
}

testConnection();
