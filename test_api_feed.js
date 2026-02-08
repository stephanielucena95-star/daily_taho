
import handler from './api/feed.js';

async function test() {
    console.log("--------------- TESTING API/FEED.JS ---------------");

    // Mock Request
    const req = {
        url: 'http://localhost:3000/api/feed',
        method: 'GET'
    };

    console.log("Invoking handler...");
    const res = await handler(req);

    console.log("Status:", res.status);

    if (res.status === 200) {
        const data = await res.json();
        console.log(`Received ${data.length} articles.`);

        if (data.length > 0) {
            const first = data[0];
            console.log("First Article Sample:");
            console.log(" - Title:", first.title);
            console.log(" - Category:", first.category);
            console.log(" - Source URL:", first.source_url);
            console.log(" - Image URL:", first.image_url ? "Has Image" : "No Image");
            console.log(" - Summary EN (First 50 chars):", first.summary_en.substring(0, 50) + "...");
        }

        // Verify Check for Politics
        const politics = data.filter(d => d.category === 'Pulitika' || d.category === 'Politics');
        console.log(`Found ${politics.length} Politics articles in top 10.`);
    } else {
        const err = await res.json();
        console.error("Error:", err);
    }
    console.log("---------------------------------------------------");
}

test();
