
import fetch from 'node-fetch';

const INQUIRER_RSS = "https://www.inquirer.net/fullfeed/";
// I need to check constants.ts to be sure of the URL used in the app. 
// For now I will assume or wait for view_file result, but I can use the one from the app if I read it. 
// Actually I'll use the one from constants.ts in the next step.

async function inspectRSS() {
    console.log("Fetching RSS feed...");
    try {
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent("https://www.inquirer.net/fullfeed/")}`);
        const json = await res.json();

        if (json.status === 'ok') {
            console.log(`Found ${json.items.length} items.`);
            const target = json.items.find(i => i.title.includes("5 bodies found"));
            if (target) {
                console.log("--- FOUND TARGET ARTICLE ---");
                console.log("Title:", target.title);
                console.log("Description (Raw):", target.description);
                console.log("Content (if any):", target.content);
                console.log("----------------------------");
            } else {
                console.log("Target article '5 bodies found' not found in current feed. Printing first item:");
                console.log("Title:", json.items[0]?.title);
                console.log("Description:", json.items[0]?.description);
            }
        } else {
            console.error("RSS2JSON returned error:", json);
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

inspectRSS();
