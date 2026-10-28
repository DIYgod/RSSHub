import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';

const host = 'https://www.magnumphotos.com';
export const route: Route = {
    path: '/magazine',
    categories: ['picture'],
    view: ViewType.Pictures,
    example: '/magnumphotos/magazine',
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
            source: ['magnumphotos.com/'],
        },
    ],
    name: 'Magazine',
    maintainers: ['IvanWng97'],
    handler,
    url: 'magnumphotos.com/',
};

async function handler() {
    const rssUrl = `${host}/feed/`;
    const feed = await parser.parseURL(rssUrl);
    const items = await pMap(
        feed.items,
        async (item) => {
            const link = item.link!;
            const title = item.title;
            if (!title) {
                return null;
            }

            const body = await cache.tryGet<{ description: string; author?: string }>(`magnumphotos:article-body:v2:${link}`, async () => {
                const data = await ofetch(link);
                const $ = load(data);
                const description = $('#content');
                if (!description.length) {
                    throw new Error(`Magnum Photos article content was not found at ${link}. The source layout may have changed.`);
                }
                const writer = description
                    .find('.story__footer__line.author')
                    .text()
                    .match(/Written by (.*?) ·/)?.[1];
                const photographers = description
                    .find('.story__header__photographer a')
                    .toArray()
                    .map((element) => $(element).text())
                    .join(', ');
                const footerPhotographers = description
                    .find('.story__footer a.photographer .name')
                    .toArray()
                    .map((element) => $(element).text().trim())
                    .join(', ');
                const author = writer || photographers || footerPhotographers || undefined;
                description.find('ul.share, .socials, h1, .story__header__type, .story__header__photographer, .story__footer, .teasers').remove();
                return { description: description.html() ?? '', author };
            });
            return {
                title,
                pubDate: item.pubDate,
                link,
                category: item.categories,
                author: body.author,
                description: body.description,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: 'Magnum Photos',
        link: host,
        description: 'Magnum is a community of thought, a shared human quality, a curiosity about what is going on in the world, a respect for what is going on and a desire to transcribe it visually',
        item: items.filter((item) => item !== null),
    };
}
