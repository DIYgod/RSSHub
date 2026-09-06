import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const route: Route = {
    path: '/uread/:userid',
    categories: ['new-media'],
    example: '/wechat/uread/shensing',
    parameters: { userid: '公众号的微信号, 可在 微信-公众号-更多资料 中找到。并不是所有的都支持，能不能用随缘' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '公众号（优读来源）',
    maintainers: ['kt286'],
    handler,
};

async function handler(ctx) {
    const userid = ctx.req.param('userid');
    const url = `http://119.29.146.143:8080/reading/subscription/account/recent?uid=${userid}`;
    const response = await got({
        method: 'get',
        url,
    });
    const data = response.data;

    const ProcessFeed = (data) => {
        const $ = load(data);
        return $('.rich_media_content').html();
    };

    const items = await Promise.all(
        data.data.map(async (item) => {
            const link = item.url;

            const cacheIn = await cache.get(link);
            if (cacheIn) {
                return JSON.parse(cacheIn);
            }

            const response = await got({
                method: 'get',
                url: link,
            });

            const description = ProcessFeed(response.data);

            const single = {
                title: item.title,
                description,
                link,
                author: item.official_account,
                pubDate: item.publish_time,
            };
            cache.set(link, JSON.stringify(single));
            return single;
        })
    );

    return {
        title: `优读 - ${userid}`,
        link: 'https://uread.ai/',
        item: items,
    };
}
