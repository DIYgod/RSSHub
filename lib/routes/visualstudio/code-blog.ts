import { load } from 'cheerio';
import pMap from 'p-map';

import NotFoundError from '@/errors/types/not-found';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/code/blog',
    categories: ['programming'],
    example: '/visualstudio/code/blog',
    url: 'code.visualstudio.com',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['code.visualstudio.com/'],
            target: '/code/blog',
        },
    ],
    name: 'Code Blog',
    maintainers: ['cscnk52'],
    handler,
    description: 'Provides a better reading experience (full articles) over the official ones.',
    view: ViewType.Notifications,
};

async function fetchArticle(link: string): Promise<Pick<DataItem, 'description'>> {
    const data = await ofetch(link);
    const $ = load(data);

    const article = $('main.docs-main-content.body');
    if (!article.length) {
        throw new NotFoundError(`No VS Code article body was found at ${link}`);
    }
    article.children('h1').first().remove();
    article
        .children('p')
        .slice(0, 2)
        .each((_, element) => {
            const paragraph = $(element);
            const text = paragraph.text().trim();
            if (
                paragraph.hasClass('release-metadata') ||
                /^(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,\s+\d{4}\s+by\b/.test(text) ||
                /^(?:Release date|Last updated):\s+/.test(text) ||
                text.startsWith('Follow us on LinkedIn')
            ) {
                paragraph.remove();
            }
        });

    return { description: article.html() };
}

async function handler(): Promise<Data> {
    const feedData = await ofetch('https://code.visualstudio.com/feed.xml', { responseType: 'text' });
    const feed = await parser.parseString(feedData);
    const feedXml = load(feedData, { xml: true });
    const modifiedDates = new Map(
        feedXml('entry')
            .toArray()
            .map((entry) => [feedXml(entry).find('link').first().attr('href'), feedXml(entry).find('updated').text()])
    );
    const categories = new Map(
        feedXml('entry')
            .toArray()
            .map((entry) => [
                feedXml(entry).find('link').first().attr('href'),
                feedXml(entry)
                    .find('category')
                    .toArray()
                    .map((category) => feedXml(category).attr('term'))
                    .filter((term): term is string => Boolean(term)),
            ])
    );
    if (!feed.title) {
        throw new Error('VS Code blog feed has no title');
    }

    const items = await pMap(
        feed.items,
        async (item) => {
            const { link, title } = item;
            if (!link || !title) {
                throw new Error('VS Code blog feed item has no link or title');
            }
            const detail = await cache.tryGet(`vscode:article:v4:${link}`, () => fetchArticle(link));
            return {
                title,
                link,
                description: detail.description,
                pubDate: item.pubDate && Number.isFinite(Date.parse(item.pubDate)) ? parseDate(item.pubDate) : undefined,
                updated: modifiedDates.get(link) && Number.isFinite(Date.parse(modifiedDates.get(link)!)) ? parseDate(modifiedDates.get(link)!) : undefined,
                author: item.author ?? item.creator,
                category: categories.get(link),
            };
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        language: 'en',
    };
}
