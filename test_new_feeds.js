
const newFeeds = {
    'ABS-CBN': 'https://news.abs-cbn.com/feed',
    'News5': 'https://interaksyon.philstar.com/feed',
    'OneNews': 'https://onenews.ph/feed',
    'ManilaTimes': 'https://www.manilatimes.net/feed/',
    'DailyTribune': 'https://tribune.net.ph/feed/',
    'BusinessWorld': 'https://www.bworldonline.com/feed/',
    'BusinessMirror': 'https://businessmirror.com.ph/feed/',
    'PEP': 'https://www.pep.ph/feed',
    'Bilyonaryo': 'https://bilyonaryo.com.ph/feed/'
};

async function testNewFeeds() {
    for (const [name, url] of Object.entries(newFeeds)) {
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

testNewFeeds();
