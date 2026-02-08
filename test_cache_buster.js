
async function testCacheBuster() {
    const url = 'https://www.philstar.com/rss/headlines';
    const timestamp = Date.now();
    const busterUrl = `${url}?t=${timestamp}`;

    console.log(`Testing with cache buster: ${busterUrl}`);

    try {
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&_cb=${timestamp}`;
        console.log(`Bypass URL: ${apiUrl}`);
        const res = await fetch(apiUrl);
        const json = await res.json();

        if (json.status === 'ok') {
            console.log(`✅ Success: Found ${json.items.length} items`);
            const first = json.items[0];
            console.log(`   Sample: "${first.title}"`);
            console.log(`   Date: ${first.pubDate}`);
        } else {
            console.log(`❌ Failed: ${json.message}`);
        }
    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
    }
}

testCacheBuster();
