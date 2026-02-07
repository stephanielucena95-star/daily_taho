
const feeds = {
    GMA: 'https://data.gmanetwork.com/gno/rss/news/feed.xml',
    INQUIRER: 'https://newsinfo.inquirer.net/feed',
    PHILSTAR: 'https://www.philstar.com/rss/headlines',
    MB: 'https://mb.com.ph/feed',
    RAPPLER: 'https://www.rappler.com/feed/'
};

async function testFeeds() {
    for (const [name, url] of Object.entries(feeds)) {
        console.log(`\nTesting ${name}: ${url}`);
        try {
            const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
            const res = await fetch(apiUrl);
            const json = await res.json();

            if (json.status === 'ok') {
                console.log(`✅ Success: Found ${json.items.length} items`);
                const first = json.items[0];
                console.log(`   Sample: "${first.title}"`);
            } else {
                console.log(`❌ Failed: ${json.message}`);
            }
        } catch (e) {
            console.log(`❌ Error: ${e.message}`);
        }
    }
}

testFeeds();
