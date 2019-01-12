const Parser = require('rss-parser');
const parser = new Parser();

function checkDate(date) {
    expect(date).toEqual(expect.any(String));
    expect(Date.parse(date)).toEqual(expect.any(Number));
    expect(new Date() - new Date(date)).toBeGreaterThan(-1000 * 60 * 60 * 24 * 5);
    // date must be in 1 year
    expect(new Date() - new Date(date)).toBeLessThan(1000 * 60 * 60 * 24 * 30 * 12 * 5);
}

module.exports = async (response) => {
    const parsed = await parser.parseString(response.text);

    expect(parsed).toEqual(expect.any(Object));
    expect(parsed.title).toEqual(expect.any(String));
    expect(parsed.title).not.toBe('RSSHub');
    expect(parsed.description).toEqual(expect.any(String));
    expect(parsed.link).toEqual(expect.any(String));
    expect(parsed.lastBuildDate).toEqual(expect.any(String));
    expect(parsed.items).toEqual(expect.any(Array));
    checkDate(parsed.lastBuildDate);

    // check items
    const guids = [];
    parsed.items.forEach((item) => {
        expect(item).toEqual(expect.any(Object));
        expect(item.title).toEqual(expect.any(String));
        expect(item.link).toEqual(expect.any(String));
        expect(item.content).toEqual(expect.any(String));
        expect(item.guid).toEqual(expect.any(String));
        if (item.pubDate) {
            expect(item.pubDate).toEqual(expect.any(String));
            checkDate(item.pubDate);
        }

        // guid must be unique
        expect(guids).not.toContain(item.guid);
        guids.push(item.guid);
    });
};
