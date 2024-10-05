import { describe, expect, it } from 'vitest';
import app from '@/app';
import Parser from 'rss-parser';

const parser = new Parser();

describe('template', () => {
    const expectPubDate = new Date(1_546_272_000_000 - 10 * 1000);

    it(`.rss`, async () => {
        const response1 = await app.request('/test/1?format=rss');
        const parsed1 = await parser.parseString(await response1.text());

        expect(parsed1).toEqual(expect.any(Object));
        expect(parsed1.title).toEqual(expect.any(String));
        expect(parsed1.description).toEqual(expect.any(String));
        expect(parsed1.link).toEqual(expect.any(String));
        expect(parsed1.lastBuildDate).toEqual(expect.any(String));
        expect(parsed1.ttl).toEqual(expect.any(String));
        expect(parsed1.items).toEqual(expect.any(Array));

        expect(parsed1.items[0]).toEqual(expect.any(Object));
        expect(parsed1.items[0].title).toEqual(expect.any(String));
        expect(parsed1.items[0].link).toEqual(expect.any(String));
        expect(parsed1.items[0].pubDate).toBe(expectPubDate.toUTCString());
        expect(parsed1.items[0].author).toEqual(expect.any(String));
        expect(parsed1.items[0].content).toEqual(expect.any(String));
        expect(parsed1.items[0].guid).toEqual(expect.any(String));

        const response2 = await app.request('/test/1');
        const parsed2 = await parser.parseString(await response2.text());
        delete parsed1.lastBuildDate;
        delete parsed2.lastBuildDate;
        delete parsed1.feedUrl;
        delete parsed2.feedUrl;
        delete parsed1.paginationLinks;
        delete parsed2.paginationLinks;
        expect(parsed2).toMatchObject(parsed1);
    });

    it(`.atom`, async () => {
        const response = await app.request('/test/1?format=atom');
        const parsed = await parser.parseString(await response.text());

        expect(parsed).toEqual(expect.any(Object));
        expect(parsed.title).toEqual(expect.any(String));
        expect(parsed.link).toEqual(expect.any(String));
        expect(parsed.lastBuildDate).toEqual(expect.any(String));
        expect(parsed.items).toEqual(expect.any(Array));

        expect(parsed.items[0]).toEqual(expect.any(Object));
        expect(parsed.items[0].title).toEqual(expect.any(String));
        expect(parsed.items[0].link).toEqual(expect.any(String));
        expect(parsed.items[0].pubDate).toBe(expectPubDate.toISOString());
        expect(parsed.items[0].author).toEqual(expect.any(String));
        expect(parsed.items[0].content).toEqual(expect.any(String));
        expect(parsed.items[0].id).toEqual(expect.any(String));
    });

    it(`.json`, async () => {
        const jsonResponse = await app.request('/test/1?format=json');
        const rssResponse = await app.request('/test/1?format=rss');
        const jsonParsed = JSON.parse(await jsonResponse.text());
        const rssParsed = await parser.parseString(await rssResponse.text());

        expect(jsonResponse.headers.get('content-type')).toBe('application/feed+json; charset=UTF-8');

        expect(jsonParsed.items[0].title).toEqual(rssParsed.items[0].title);
        expect(jsonParsed.items[0].url).toEqual(rssParsed.items[0].link);
        expect(jsonParsed.items[0].id).toEqual(rssParsed.items[0].guid);
        expect(jsonParsed.items[0].date_published).toEqual(expectPubDate.toISOString());
        expect(jsonParsed.items[0].content_html).toEqual(rssParsed.items[0].content);
        expect(jsonParsed.items[0].authors[0].name).toEqual(rssParsed.items[0].author);
        expect(jsonParsed.items.every((item) => item.authors.every((author) => author.name.includes(' ')))).toBe(false);
    });

    it('.debug.html', async () => {
        const jsonResponse = await app.request('/test/1?format=json');
        const jsonParsed = JSON.parse(await jsonResponse.text());

        const debugHTMLResponse0 = await app.request('/test/1?format=0.debug.html');
        expect(debugHTMLResponse0.headers.get('content-type')).toBe('text/html; charset=UTF-8');
        expect(await debugHTMLResponse0.text()).toBe(jsonParsed.items[0].content_html);

        const debugHTMLResponseNotExist = await app.request(`/test/1?format=${jsonParsed.items.length}.debug.html`);
        expect(await debugHTMLResponseNotExist.text()).toBe(`data.item[${jsonParsed.items.length}].description not found`);
    });

    it('flatten author object', async () => {
        const response = await app.request('/test/json');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items[2].author).toBe(['DIYgod1', 'DIYgod2'].map((name) => name).join(', '));
        expect(parsed.items[3].author).toBe(['DIYgod3', 'DIYgod4', 'DIYgod5'].map((name) => name).join(', '));
        expect(parsed.items[4].author).toBeUndefined();
    });

    it(`long title`, async () => {
        const response = await app.request('/test/long');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items[0].title?.length).toBe(153);
    });

    it(`enclosure`, async () => {
        const response = await app.request('/test/enclosure');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.itunes?.author).toBe('DIYgod');
        expect(parsed.items[0].enclosure?.url).toBe('https://github.com/DIYgod/RSSHub/issues/1');
        expect(parsed.items[0].enclosure?.length).toBe('3661');
        expect(parsed.items[0].itunes.duration).toBe('10:10:10');
    });
});
