import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/event/hot/:locationId',
    categories: ['social-media'],
    example: '/douban/event/hot/118172',
    parameters: { locationId: '位置 id, [同城首页](https://www.douban.com/location)打开控制台执行 `window.__loc_id__` 获取' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '热门同城活动',
    maintainers: ['xyqfer'],
    handler,
};

async function handler(ctx) {
    const { locationId = 0 } = ctx.req.param();
    const referer = 'https://m.douban.com/app_topic/event_hot';

    const response = await got({
        method: 'get',
        url: `https://m.douban.com/rexxar/api/v2/subject_collection/event_hot/items?os=ios&for_mobile=1&callback=&start=0&count=20&loc_id=${locationId}`,
        headers: {
            Referer: referer,
        },
    });

    return {
        title: `豆瓣同城-热门活动-${locationId}`,
        link: referer,
        item: response.data.subject_collection_items.map(({ title, url, cover, subtype, info, price_range }) => {
            const description = `<img src="${cover.url}"><br>
              ${info}/${subtype}/${price_range}
            `;

            return {
                title,
                description,
                link: url,
            };
        }),
    };
}
