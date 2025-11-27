import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category',
    categories: ['traditional-media'],
    example: '/cts/real',
    parameters: { category: '类别' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['news.cts.com.tw/:category/index.html'],
        },
    ],
    name: '新聞',
    maintainers: ['miles170'],
    handler,
    description: `| 即時 | 氣象    | 政治     | 國際          | 社會    | 運動   | 生活 | 財經  | 台語      | 地方  | 產業 | 綜合    | 藝文 | 娛樂      |
| ---- | ------- | -------- | ------------- | ------- | ------ | ---- | ----- | --------- | ----- | ---- | ------- | ---- | --------- |
| real | weather | politics | international | society | sports | life | money | taiwanese | local | pr   | general | arts | entertain |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const currentUrl = `https://news.cts.com.tw/${category}/index.html`;
    const response = await got(currentUrl);
    const $ = load(response.data);
    const items = await pMap(
        $('#newslist-top a[title]').slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20),
        (item) => {
            item = $(item);
            const link = item.attr('href');
            return cache.tryGet(link, async () => {
                const response = await got(link);
                const $ = load(response.data);
                const author = $('.artical-content p:eq(0)').text().trim();
                $('.artical-content p:eq(0), .artical-content .flexbox').remove();

                return {
                    title: item.attr('title'),
                    author,
                    description: $('.artical-content').html(),
                    category: $('meta[property="article:section"]').attr('content'),
                    pubDate: parseDate($('meta[property="article:published_time"]').attr('content')),
                    link,
                };
            });
        },
        { concurrency: 5 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').attr('content'),
        item: items,
    };
}
