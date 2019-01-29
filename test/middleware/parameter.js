const supertest = require('supertest');
const { server } = require('../../lib/index');
const request = supertest(server);
const Parser = require('rss-parser');
const parser = new Parser();

afterAll(() => {
    server.close();
});

describe('filter', () => {
    it(`filter`, async () => {
        const response = await request.get('/test/1?filter=Item4|Title5');
        const parsed = await parser.parseString(response.text);
        expect(parsed.items.length).toBe(2);
        expect(parsed.items[0].title).toBe('Title4');
        expect(parsed.items[1].title).toBe('Title5');
    });

    it(`filter_title`, async () => {
        const response = await request.get('/test/1?filter_title=Item4|Title5');
        const parsed = await parser.parseString(response.text);
        expect(parsed.items.length).toBe(1);
        expect(parsed.items[0].title).toBe('Title5');
    });

    it(`filter_description`, async () => {
        const response = await request.get('/test/1?filter_description=Item4|Title5');
        const parsed = await parser.parseString(response.text);
        expect(parsed.items.length).toBe(1);
        expect(parsed.items[0].title).toBe('Title4');
    });

    it(`filter_author`, async () => {
        const response = await request.get('/test/1?filter_author=DIYgod4|DIYgod5');
        const parsed = await parser.parseString(response.text);
        expect(parsed.items.length).toBe(2);
        expect(parsed.items[0].title).toBe('Title4');
        expect(parsed.items[1].title).toBe('Title5');
    });

    it(`filterout`, async () => {
        const response = await request.get('/test/1?filterout=Item4|Title5');
        const parsed = await parser.parseString(response.text);
        expect(parsed.items.length).toBe(3);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
    });

    it(`filterout_title`, async () => {
        const response = await request.get('/test/1?filterout_title=Item4|Title5');
        const parsed = await parser.parseString(response.text);
        expect(parsed.items.length).toBe(4);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
        expect(parsed.items[3].title).toBe('Title4');
    });

    it(`filterout_description`, async () => {
        const response = await request.get('/test/1?filterout_description=Item4|Title5');
        const parsed = await parser.parseString(response.text);
        expect(parsed.items.length).toBe(4);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
        expect(parsed.items[3].title).toBe('Title5');
    });

    it(`filterout_author`, async () => {
        const response = await request.get('/test/1?filterout_author=DIYgod4|DIYgod5');
        const parsed = await parser.parseString(response.text);
        expect(parsed.items.length).toBe(3);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
    });
});

describe('limit', () => {
    it(`limit`, async () => {
        const response = await request.get('/test/1?limit=3');
        const parsed = await parser.parseString(response.text);
        expect(parsed.items.length).toBe(3);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
    });
});

describe('tgiv', () => {
    it(`tgiv`, async () => {
        const response = await request.get('/test/1?tgiv=test');
        const parsed = await parser.parseString(response.text);
        expect(parsed.items[0].link).toBe(`https://t.me/iv?url=https%3A%2F%2Fgithub.com%2FDIYgod%2FRSSHub%2Fissues%2F1&rhash=test`);
        expect(parsed.items[1].link).toBe(`https://t.me/iv?url=https%3A%2F%2Fgithub.com%2FDIYgod%2FRSSHub%2Fissues%2F2&rhash=test`);
    });
});
