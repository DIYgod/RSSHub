import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { renderDescription } from './templates/description';

const handler = async () => {
    const link = 'https://coolidge.org/film-guide';
    const html = await ofetch(link);
    const $ = load(html);

    const container = $('#block-coolidge-content > article > div.node__content > div').first();

    const cover = container.find('p').eq(0).find('img').first().attr('src');
    const title = container.find('p').eq(1).text().trim();
    const description = container.find('p').eq(2).text().trim();
    const linkEl = container.find('a').first();
    const itemLink = linkEl.attr('href');

    const absoluteCover = cover ? new URL(cover, link).href : undefined;
    const absoluteItemLink = itemLink ? new URL(itemLink, link).href : undefined;

    const rendered = renderDescription({
        image: absoluteCover,
        intro: description,
    });

    return {
        title: 'Coolidge Corner Theatre - Film Guide',
        link,
        description: 'Film Guide',
        item: [
            {
                title,
                description: rendered,
                link: absoluteItemLink ?? link,
                guid: absoluteItemLink ?? absoluteCover ?? link,
            },
        ],
    };
};

export const route: Route = {
    path: '/film-guide',
    name: 'Film Guide',
    url: 'coolidge.org/film-guide',
    maintainers: ['johan456789'],
    example: '/coolidge/film-guide',
    categories: ['blog'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    handler,
};
