import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

export const route: Route = {
    path: '/rczp/:type',
    categories: ['university'],
    example: '/nju/rczp/xxfb',
    parameters: { type: '分类名' },
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
            source: ['rczp.nju.edu.cn/sylm/:type/index.html'],
        },
    ],
    name: '人才招聘网',
    maintainers: ['ret-1'],
    handler,
    description: `| 信息发布 | 教研类岗位 | 管理岗位及其他 |
| -------- | ---------- | -------------- |
| xxfb     | jylgw      | gllgw          |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const title_dict = {
        xxfb: { title: '信息发布', channelid: '9531,9532,9533,9534,9535,9419' },
        jylgw: { title: '教研类岗位', channelid: '9420,9421,9422,9423' },
        gllgw: { title: '管理岗位及其他', channelid: '9424,9425,9426' },
    };
    const link = `https://rczp.nju.edu.cn/sylm/${type}/index.html`;

    const data = await cache.tryGet(
        `nju:rczp:${type}`,
        async () => {
            const { data } = await got.post('https://rczp.nju.edu.cn/njdx/openapi/t/info/list.do', {
                headers: {
                    referer: link,
                    'x-requested-with': 'XMLHttpRequest',
                },
                form: {
                    channelid: Buffer.from(title_dict[type].channelid).toString('base64'),
                    pagesize: Buffer.from('15').toString('base64'),
                    pageno: Buffer.from('1').toString('base64'),
                    hasPage: Buffer.from('true').toString('base64'),
                },
            });
            return data;
        },
        config.cache.routeExpire,
        false
    );

    const items = data.infolist.map((item) => ({
        title: item.title,
        description: item.summary,
        link: item.url,
        pubDate: parseDate(item.releasetime, 'x'),
        author: item.username,
    }));

    return {
        title: `人才招聘-${title_dict[type].title}`,
        link,
        item: items,
    };
}
