import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: ['/topics/:topic'],
    categories: ['traditional-media'],
    example: '/sankei/topics/etc_100',
    parameters: {
        topic: 'Topic name (format included in URL). For example, for "Expo 2025 Osaka, Kansai, Japan Special Feature" https://www.sankei.com/tag/topic/etc_100, the value would be etc_100.',
    },
    radar: [
        {
            source: ['www.sankei.com/tag/topic/:topic'],
            target: '/topics/:topic',
        },
    ],
    name: 'Topic',
    maintainers: ['yuikisaito'],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const baseUrl = 'https://www.sankei.com';
    const { topic } = ctx.req.param();
    const url = `${baseUrl}/tag/topic/${topic}/`;

    const response = await got(url);
    const $ = load(response.body);
    const categoryName = $('li.breadcrumb-list-item:nth-of-type(3) > a').text();

    const listSelector = $('div.story-card-feed.grid.hide_on_mobile > div > article');

    const items: DataItem[] = await Promise.all(
        listSelector.toArray().map((el) => {
            const item = $(el);
            item.find('p a').remove();

            const title = item.find('div.story-card-flex > h3.headline > a').text();
            const link = baseUrl + (item.find('div.story-card-flex > h3.headline > a').attr('href') || '');
            const pubDate = parseDate(item.find('div.story-card-flex > div > time').attr('datetime') || '');

            return cache.tryGet(link, async () => {
                const detail = await got(link);
                const $ = load(detail.body);
                $('.inline-gptAd, .figure_image_sizer').remove();
                const articleHTML = $('div.article-body').html() || '';

                return {
                    title,
                    link,
                    pubDate,
                    description: articleHTML,
                };
            });
        })
    );

    return {
        title: '産経ニュース - ' + categoryName,
        description: $('meta[name="description"]').attr('content'),
        link: url,
        image: $('meta[property="og:image"]').attr('content'),
        language: 'ja',
        item: items,
    };
}
