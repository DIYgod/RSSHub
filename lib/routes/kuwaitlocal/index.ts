import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/kuwaitlocal/article',
    parameters: { category: 'Category name, can be found in URL, `latest` by default' },
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
            source: ['kuwaitlocal.com/news/categories/:category'],
            target: '/:category',
        },
    ],
    name: 'Categorised News',
    maintainers: ['TonyRL'],
    handler,
    url: 'kuwaitlocal.com/news/latest',
};

async function handler(ctx): Promise<Data> {
    const baseUrl = 'https://kuwaitlocal.com';
    const { category = 'latest' } = ctx.req.param();
    const url = `${baseUrl}/news/${category === 'latest' ? category : `categories/${category}`}`;

    const { data: response } = await got(url);
    const $ = load(response);
    const list = $('a.ggrid')
        .toArray()
        .flatMap((item): Array<DataItem & { link: string }> => {
            const $item = $(item);
            const href = $item.attr('href');
            if (!href) {
                return [];
            }
            return [
                {
                    title: $item.find('.txt').text(),
                    link: new URL(href, url).href,
                },
            ];
        });

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(`kuwaitlocal:article:v3:${item.link}`, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                const date = $('.single_news_meta span').eq(0).text().trim();
                const category = $('.tags .tag')
                    .toArray()
                    .map((item) => $(item).text().trim());
                $('[id^=div-gpt-ad]').remove();
                $('.tags_sec2, .tags_sec, .comment').remove();
                const articleBody = $('#news_description').html();
                if (!articleBody) {
                    throw new Error(`Cannot find article content on ${item.link}`);
                }
                return {
                    pubDate: date ? parseDate(date) : undefined,
                    category,
                    description: ($('.single_news_img').html() ?? '') + articleBody,
                };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content')?.trim(),
        link: url,
        item: items,
        language: 'en',
    };
}
