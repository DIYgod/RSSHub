import fs from 'node:fs';
import path from 'node:path';

import { renderToString } from 'hono/jsx/dom/server';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';

import server from '@/setup.test';
import type { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import parser from '@/utils/rss-parser';
import RSS from '@/views/rss';

import { extractDRArticle, getNews } from './utils';

const fixturesDir = path.join(__dirname, 'fixtures');
const feedXml = fs.readFileSync(path.join(fixturesDir, 'feed.xml'), 'utf8');
const articleHtml = fs.readFileSync(path.join(fixturesDir, 'article.html'), 'utf8');

const feedUrl = 'https://www.dr.dk/nyheder/service/feeds/indland';

const stubFeed = async () => {
    const { default: server } = await import('@/setup.test');
    server.use(http.get(feedUrl, () => HttpResponse.text(feedXml, { headers: { 'content-type': 'application/xml' } })));
};

const stubArticle = async () => {
    const { default: server } = await import('@/setup.test');
    server.use(http.get('https://www.dr.dk/nyheder/indland/*', () => HttpResponse.text(articleHtml)));
};

describe('DR RSS parsing', () => {
    it('parses the official RSS feed', async () => {
        const { default: server } = await import('@/setup.test');
        server.use(http.get(feedUrl, () => HttpResponse.text(feedXml, { headers: { 'content-type': 'application/xml' } })));

        const feed = await parser.parseURL(feedUrl);

        expect(feed.title).toBe('Indland | DR');
        expect(feed.language).toBe('da');
        expect(feed.items.length).toBeGreaterThan(0);

        const item = feed.items.find((i) => i.link?.includes('frygt-naturen'))!;
        expect(item.title).toContain('Frygt for naturen');
        expect(item.link).toBe('https://www.dr.dk/nyheder/indland/frygt-naturen-er-ude-af-proportioner-mener-eksperter-det-er-ikke-bare-naturangst-det-er-hysterisk');
        expect(item.guid).toBe('urn:dr:umbraco:article:111ea74f-9a12-4aa2-94d6-46105268ccf2');
        expect(item.pubDate).toBe('Sun, 30 Aug 2026 11:07:00 GMT');
        expect(item.contentSnippet).toContain('Vi er blevet mere fremmede over for naturen');
    });
});

describe('DR article extraction', () => {
    it('extracts full article content from the page', () => {
        const article = extractDRArticle(articleHtml);

        expect(article).not.toBeNull();
        expect(article!.title).toBe('Frygt for naturen er ude af proportioner, mener eksperter');
        expect(article!.author).toBe('Annette Jespersen, Asta Holst Bach');
        expect(article!.category).toBe('Indland');
        expect(article!.image).toContain('20260709-172845-l.jpg');
        expect(article!.pubDate).toBe('2026-08-30T11:07:00+00:00');

        const content = article!.content;
        // paragraphs
        expect(content).toContain('<p>Ulvedebatten raser');
        // inline bold
        expect(content).toContain('<strong>Rasmus Ejrnæs</strong>');
        // inline link
        expect(content).toContain('<a href="https://www.dr.dk/nyheder/indland/eksempel">her</a>');
        // heading
        expect(content).toContain('<h2>Professor: Vi er uvante med naturen</h2>');
        // quote with citation
        expect(content).toContain('<blockquote>');
        expect(content).toContain('Rune Engelbreht Larsen, idéhistoriker');
        // list
        expect(content).toContain('<ul>');
        expect(content).toContain('<li>');
        // image with figure and caption
        expect(content).toContain('<figure>');
        expect(content).toContain('<img src="https://asset.dr.dk/drdk/umbraco-images/t0ofa3bi/rune.jpg"');
        expect(content).toContain('<figcaption>Rune Engelbreht Larsen mener, at fakta betyder noget</figcaption>');
        // media poster
        expect(content).toContain('urn:dr:od3:clippublication:6a8309ca9590f6145c9a361c');
    });

    it('excludes related articles, interactive graphics and embeds', () => {
        const article = extractDRArticle(articleHtml)!;

        expect(article.content).not.toContain('Ponyen Bellami');
        expect(article.content).not.toContain('automat.drintern.dk');
        expect(article.content).not.toContain('interactive');
    });

    it('returns null when the page has no article data', () => {
        expect(extractDRArticle('<html><body><p>nothing here</p></body></html>')).toBeNull();
    });
});

describe('DR news route item', () => {
    afterEach(() => {
        server.resetHandlers();
        (cache as any).clients.memoryCache?.clear();
    });

    it('produces items with title, link, guid and date', async () => {
        stubFeed();
        stubArticle();

        const data = await getNews('indland');

        expect(data.title).toBe('Indland | DR');
        const item = data.item!.find((i) => i.link?.includes('frygt-naturen'))!;

        expect(item.title).toContain('Frygt for naturen');
        expect(item.link).toBe('https://www.dr.dk/nyheder/indland/frygt-naturen-er-ude-af-proportioner-mener-eksperter-det-er-ikke-bare-naturangst-det-er-hysterisk');
        expect(item.guid).toBe('urn:dr:umbraco:article:111ea74f-9a12-4aa2-94d6-46105268ccf2');
        expect(new Date(item.pubDate!).toISOString()).toBe('2026-08-30T11:07:00.000Z');
        expect(item.author).toBe('Annette Jespersen, Asta Holst Bach');
        expect(item.category).toBe('Indland');
    });

    it('embeds the full article text in the description', async () => {
        stubFeed();
        stubArticle();

        const data = await getNews('indland');
        const item = data.item!.find((i) => i.link?.includes('frygt-naturen'))!;

        expect(item.description).toContain('<p>Ulvedebatten raser');
        expect(item.description).toContain('Professor: Vi er uvante med naturen');
        // must not be a short snippet
        expect(item.description!.length).toBeGreaterThan(200);
    });

    it('falls back to the official RSS description when extraction fails', async () => {
        stubFeed();
        const { default: server } = await import('@/setup.test');
        // no article stub: the real page would not resolve in tests, extraction returns null
        server.use(http.get('https://www.dr.dk/nyheder/indland/*', () => HttpResponse.text('<html><body></body></html>')));

        const data = await getNews('indland');
        const item = data.item!.find((i) => i.link?.includes('frygt-naturen'))!;

        expect(item.description).toContain('Vi er blevet mere fremmede over for naturen');
    });
});

describe('DR route output XML', () => {
    it('renders valid RSS/XML with the full article body', () => {
        const data: Data = {
            title: 'Indland | DR',
            link: 'https://www.dr.dk/',
            description: 'Nyheder fra sektionen Indland',
            item: [
                {
                    title: 'Frygt for naturen er ude af proportioner',
                    link: 'https://www.dr.dk/nyheder/indland/eksempel',
                    guid: 'urn:dr:umbraco:article:111ea74f-9a12-4aa2-94d6-46105268ccf2',
                    pubDate: 'Sun, 30 Aug 2026 11:07:00 GMT',
                    author: 'Annette Jespersen',
                    category: 'Indland',
                    description: '<p>Ulvedebatten raser, og senest var der torsdag aften ulvemøde i Egtved.</p>',
                },
            ],
        };

        const xml = renderToString(RSS({ data }) as any);

        expect(xml).toMatch(/^<rss/);
        expect(xml).toContain('<title>Frygt for naturen er ude af proportioner</title>');
        expect(xml).toContain('<link>https://www.dr.dk/nyheder/indland/eksempel</link>');
        expect(xml).toContain('<guid isPermaLink="false">urn:dr:umbraco:article:111ea74f-9a12-4aa2-94d6-46105268ccf2</guid>');
        expect(xml).toContain('Sun, 30 Aug 2026 11:07:00 GMT');
        expect(xml).toContain('<author>Annette Jespersen</author>');
        expect(xml).toContain('<category>Indland</category>');
        // the HTML description is entity-escaped but decodable back to full text
        expect(xml).toContain('&lt;p&gt;Ulvedebatten raser');
        expect(xml).toContain('</channel>');
        expect(xml).toContain('</rss>');
    });

    it('produces parseable XML from the real route output', async () => {
        const data: Data = {
            title: 'Indland | DR',
            link: 'https://www.dr.dk/',
            description: 'Nyheder fra sektionen Indland',
            item: [
                {
                    title: 'Frygt for naturen er ude af proportioner',
                    link: 'https://www.dr.dk/nyheder/indland/eksempel',
                    guid: 'urn:dr:umbraco:article:111ea74f-9a12-4aa2-94d6-46105268ccf2',
                    pubDate: 'Sun, 30 Aug 2026 11:07:00 GMT',
                    description: '<p>Ulvedebatten raser.</p>',
                },
            ],
        };

        const xml = renderToString(RSS({ data }) as any);
        const parsed = await parser.parseString(xml.replaceAll('<rss ', '<rss xmlns="http://www.w3.org/2005/Atom" '));

        expect(parsed.items).toHaveLength(1);
        expect(parsed.items[0].title).toBe('Frygt for naturen er ude af proportioner');
        expect(parsed.items[0].guid).toBe('urn:dr:umbraco:article:111ea74f-9a12-4aa2-94d6-46105268ccf2');
    });

    it('keeps the item shape valid for the whole feed', async () => {
        stubFeed();
        stubArticle();

        const data = await getNews('indland');
        const items = (data.item ?? []) as DataItem[];

        for (const item of items) {
            expect(item.title).toEqual(expect.any(String));
            expect(item.link).toEqual(expect.any(String));
            expect(item.guid).toEqual(expect.any(String));
            if (item.pubDate) {
                const pubDate = Date.parse(String(item.pubDate));
                expect(Number.isNaN(pubDate)).toBe(false);
            }
            expect(item.description).toEqual(expect.any(String));
        }
    });
});
