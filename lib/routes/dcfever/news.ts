import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { baseUrl, parseItem } from './utils';

export const route: Route = {
    path: '/news/:type?',
    categories: ['new-media'],
    example: '/dcfever/news',
    parameters: { type: '分類，預設為所有新聞' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新聞中心',
    maintainers: ['TonyRL'],
    handler,
    description: `| 所有新聞 | 攝影器材 | 手機通訊 | 汽車熱話 | 攝影文化    | 影片攝錄    | 測試報告 | 生活科技 | 攝影技巧  |
  | -------- | -------- | -------- | -------- | ----------- | ----------- | -------- | -------- | --------- |
  |          | camera   | mobile   | auto     | photography | videography | reviews  | gadget   | technique |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');

    const response = await got(`${baseUrl}/news/index.php`, {
        searchParams: {
            type: type ?? undefined,
        },
    });
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
        title: `${$('.channel_nav')
            .contents()
            .filter((_, e) => e.nodeType === 3)
            .text()} - ${$('head title').text()}`,
        link: response.url,
        image: 'https://cdn10.dcfever.com/images/android_192.png',
        item: items,
    };
}
