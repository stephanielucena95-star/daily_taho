
import handler from './api/rss.js';

async function testRSS() {
    console.log("--------------- TESTING API/RSS.JS ---------------");

    // Mock Request
    const req = {
        url: 'http://localhost:3000/api/rss',
        method: 'GET'
    };

    console.log("Invoking handler...");
    const res = await handler(req);

    console.log("Status:", res.status);
    console.log("Content-Type:", res.headers['content-type'] || res.headers.get('content-type'));

    if (res.status === 200) {
        // Response body might be a string or a stream depending on environment simulation
        // In our handler it returns a string in Response constructor
        // But Response object in Node (via 'node-fetch' or similar polyfills if present) might need .text()

        let text = "";
        try {
            text = await res.text();
        } catch (e) {
            text = res.body; // fallback if simple object
        }

        console.log("\n--- XML OUTPUT PREVIEW (First 500 chars) ---");
        console.log(text.substring(0, 500));
        console.log("...\n");

        if (text.includes('<rss') && text.includes('</rss>')) {
            console.log("✅ Valid RSS Structure detected.");
        } else {
            console.error("❌ Invalid RSS Structure.");
        }

        if (text.includes('<item>')) {
            console.log("✅ Contains items.");
        } else {
            console.log("⚠️ No items found (feed might be empty or fetch failed).");
        }

    } else {
        console.error("Error Status:", res.status);
    }
    console.log("---------------------------------------------------");
}

testRSS();
