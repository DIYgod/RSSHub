import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';

const feeds = {
    'Top Headlines': 'topheadlines',
    'Recent Headlines': 'mostrecent',
    Kelowna: 'page-1',
    'West-Kelowna': 'page-101',
    Peachland: 'page-86',
    Vernon: 'page-2',
    'Salmon-Arm': 'page-61',
    Penticton: 'page-21',
    'Oliver-Osoyoos': 'page-87',
    Kamloops: 'page-48',
    Nelson: 'page-91',
    BC: 'page-3',
    Canada: 'page-4',
    World: 'page-5',
    Business: 'page-6',
    Sports: 'page-7',
    ShowBiz: 'page-8',
};

export const route: Route = {
    path: '/:category?',
    categories: ['traditional-media'],
    example: '/castanet/Kelowna',
    parameters: {
        category: {
            options: Object.keys(feeds).map((k) => ({
                value: k,
                label: k,
            })),
            description: 'Category',
            default: 'Recent Headlines',
        },
    },
    radar: [
        {
            source: ['www.castanet.net/news/:category/'],
            target: '/:category',
        },
        {
            source: ['www.castanet.net/'],
            target: '/',
        },
    ],
    name: 'News',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.castanet.net',
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'Recent Headlines';
    const baseUrl = 'https://www.castanet.net';
    const feedFile = feeds[category] ?? category;
    const feedUrl = `${baseUrl}/rss/${feedFile}.xml`;

    const feed = await parser.parseURL(feedUrl);

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link as string, async () => {
                const response = await ofetch(item.link as string);
                const $ = load(response);

                delete item.content;
                delete item.contentSnippet;
                delete item.isoDate;

                const content = $('.newsstory');
                content.find('.newsheadlinefull, .newsheadline, .byline, .click_gallery').remove();
                if (content.find('.gallery_img1').length) {
                    const a = content.find('.gallery_img1 a').toArray();
                    content.find('.gallery_img1').next().remove();
                    for (const ele of a) {
                        const $ele = $(ele);
                        const href = $ele.attr('href');
                        const figure = `<figure><img src="${href}" alt="${$ele.text().trim()}"><figcaption>${$ele.attr('title')?.trim() ?? ''}</figcaption></figure>`;
                        $ele.replaceWith(figure);
                    }
                }

                item.description = content.html()?.trim();

                return item;
            })
        )
    );

    return {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        image: feed.image?.url,
        language: feed.language,
        item: items,
    };
}
