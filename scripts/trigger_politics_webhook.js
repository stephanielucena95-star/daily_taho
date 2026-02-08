
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// CONFIGURATION
const API_URL = process.env.FEED_API_URL || 'https://daily-taho.vercel.app/api/feed'; // Default to prod, override with localhost for testing
const WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL; // Required
const STATE_FILE = path.join(process.cwd(), 'scripts', '.processed_politics.json');

// Ensure scripts dir exists
if (!fs.existsSync(path.join(process.cwd(), 'scripts'))) {
    fs.mkdirSync(path.join(process.cwd(), 'scripts'));
}

async function run() {
    if (!WEBHOOK_URL) {
        console.error("❌ Error: process.env.MAKE_WEBHOOK_URL is not set.");
        process.exit(1);
    }

    console.log(`🔍 Checking for new Politics articles from ${API_URL}...`);

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`API responded with ${response.status}`);

        const articles = await response.json();

        // Load state
        let processedIds = [];
        if (fs.existsSync(STATE_FILE)) {
            try {
                processedIds = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
            } catch (e) {
                console.warn("⚠️ Could not read state file, starting fresh.");
            }
        }

        // Filter for NEW Politics articles
        // Note: The system category for Politics is 'Pulitika'
        const newPoliticsArticles = articles.filter(article => {
            const isPolitics = article.category === 'Pulitika' || article.category === 'Politics';
            const isNew = !processedIds.includes(article.id);
            return isPolitics && isNew;
        });

        if (newPoliticsArticles.length === 0) {
            console.log("✅ No new politics articles to report.");
            return;
        }

        console.log(`🚀 Found ${newPoliticsArticles.length} new politics article(s). Sending to Webhook...`);

        // Send each new article to the webhook
        for (const article of newPoliticsArticles) {
            try {
                const whResponse = await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event: 'new_politics_article',
                        article: article
                    })
                });

                if (whResponse.ok) {
                    console.log(`   - Sent: "${article.title}"`);
                    processedIds.push(article.id);
                } else {
                    console.error(`   - Failed to send: "${article.title}" (${whResponse.statusText})`);
                }
            } catch (e) {
                console.error(`   - Error sending "${article.title}":`, e.message);
            }
        }

        // Save updated state
        // Limit state size to prevent infinite growth (keep last 500)
        if (processedIds.length > 500) {
            processedIds = processedIds.slice(processedIds.length - 500);
        }
        fs.writeFileSync(STATE_FILE, JSON.stringify(processedIds, null, 2));
        console.log("💾 State updated.");

    } catch (error) {
        console.error("❌ Fatal Error:", error.message);
        process.exit(1);
    }
}

run();
