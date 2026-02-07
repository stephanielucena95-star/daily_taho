
const variations = {
    'ABS-CBN-alt': 'https://news.abs-cbn.com/rss',
    'ManilaTimes-alt': 'https://www.manilatimes.net/news/feed',
    'BusinessMirror-alt': 'https://businessmirror.com.ph/feed',
    'PEP-alt': 'https://www.pep.ph/rss/news',
    'Interaksyon': 'https://www.interaksyon.com/feed/',
    'Bilyonaryo-alt': 'https://bilyonaryo.com/feed/'
};

async function testVariations() {
    for (const [name, url] of Object.entries(variations)) {
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

testVariations();
