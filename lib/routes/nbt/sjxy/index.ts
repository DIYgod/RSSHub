import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';

const host = 'https://sjxy.nbt.edu.cn/';
const typeMap = {
    notice: '/index/tzgg.htm',
    news: '/index/xwdt.htm',
};

const titleMap = {
    notice: '通知公告',
    news: '新闻动态',
};

export const route: Route = {
    path: '/sjxy/:type',
    categories: ['university'],
    example: '/nbt/sjxy/notice',
    parameters: { type: '通知类型，默认为通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '通知公告',
    maintainers: ['bellongyan'],
    handler,
    description: `| 通知公告 | 新闻动态 |
    | ---------- | ----- |
    | notice     | news  |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'notice';
    const link = host + typeMap[type];

    const title = '浙大宁波理工学院' + titleMap[type];
    const response = await got.get(link);
    const $ = load(response.data);
    const list = $('div[class="lm_list"] ul').find('li');

    const items = await Promise.all(
        list.map(async (i, item) => {
            const info = $(item).find('a').attr('href');
            const pageUrl = host + info?.substring(2, info.length);

            const result = await cache.tryGet(pageUrl, async () => {
                const page = await got.get(pageUrl);
                const $ = load(page.data);
                return {
                    desc: $('form[name="_newscontent_fromname"]').html(),
                };
            });
            const desc = typeof result === 'object' && result !== null ? result.desc : null;
            return {
                title: $(item).find('a').text(),
                link: pageUrl,
                description: desc,
            };
        })
    );
    return {
        title,
        link,
        item: items,
    };
}
