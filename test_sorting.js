
const MOCK_DATA = [
    { title: 'Newest', pubDate: '2026-02-07 13:00:00', sourceName: 'Source A' },
    { title: 'Middle', pubDate: '2026-02-07 10:00:00', sourceName: 'Source B' },
    { title: 'Oldest', pubDate: '2026-02-07 08:00:00', sourceName: 'Source A' },
];

function testLogic(items) {
    console.log("Input items:", items.length);

    // 1. Sort by date
    const sorted = [...items].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    console.log("Sorted first item:", sorted[0].title, "(Expected: Newest)");

    // 2. Diversity selection (simplified)
    const grouped = {};
    sorted.forEach(item => {
        if (!grouped[item.sourceName]) grouped[item.sourceName] = [];
        grouped[item.sourceName].push(item);
    });

    const selection = [];
    const sources = Object.keys(grouped);
    let depth = 0;
    while (selection.length < 10 && depth < 5) {
        sources.forEach(s => {
            if (grouped[s][depth]) selection.push(grouped[s][depth]);
        });
        depth++;
    }

    console.log("Selection before final sort:", selection.map(i => i.title));

    // 3. Final sort
    selection.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    console.log("Final Selection:", selection.map(i => `${i.title} (${i.pubDate})`));

    if (selection[0].title === 'Newest') {
        console.log("✅ PASS: Newest article is at the top.");
    } else {
        console.log("❌ FAIL: Newest article is NOT at the top.");
    }
}

testLogic(MOCK_DATA);
