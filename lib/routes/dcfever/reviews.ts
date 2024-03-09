import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { baseUrl, parseItem } from './utils';

export const route: Route = {
    path: '/reviews/:type?',
    categories: ['new-media'],
    example: '/dcfever/reviews/cameras',
    parameters: { type: '分類，預設為 `cameras`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['dcfever.com/:type/reviews.php'],
        target: '/reviews/:type',
    },
    name: '測試報告',
    maintainers: ['TonyRL'],
    handler,
    description: `| 相機及鏡頭 | 手機平板 | 試車報告 |
  | ---------- | -------- | -------- |
  | cameras    | phones   | cars     |`,
};

async function handler(ctx) {
    const { type = 'cameras' } = ctx.req.param();

    const response = await got(`${baseUrl}/${type}/reviews.php`);
    const $ = load(response.data);

    const list = $('.col-md-left .title a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: new URL(item.attr('href'), response.url).href,
            };
        });

    const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

    return {
        title: $('head title').text(),
        link: response.url,
        image: 'https://cdn10.dcfever.com/images/android_192.png',
        item: items,
    };
}
