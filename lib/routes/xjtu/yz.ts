import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/yz/:category?',
    categories: ['university'],
    example: '/xjtu/yz/zsdt',
    parameters: { category: '栏目类型，默认请求`zsdt`，详见下方表格' },
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
            source: ['yz.xjtu.edu.cn/index/:category.htm'],
            target: '/yz/:category',
        },
    ],
    name: '研究生招生信息网',
    maintainers: ['YoghurtGuy'],
    handler,
    description: `栏目类型

| 招生动态 | 通知公告 | 政策法规 | 招生统计 | 历年复试线 | 博士招生 | 硕士招生 | 推免生 | 其他招生 |
| -------- | -------- | -------- | -------- | ---------- | -------- | -------- | ------ | -------- |
| zsdt     | tzgg     | zcfg     | zstj     | lnfsx      | bszs     | sszs     | tms    | qtzs     |`,
};
async function handler(ctx) {
    const { category = 'zsdt' } = ctx.req.param();
    const baseUrl = 'https://yz.xjtu.edu.cn';

    const response = await ofetch(`${baseUrl}/index/${category}.htm`);
    const $ = load(response);
    const list = $('div.list-con ul li')
        .toArray()
        .map((item_) => {
            const item = $(item_);
            const a = item.find('a');
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate(item.find('span.date.fr').text()), +8),
            } as DataItem;
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                try {
                    const res = await ofetch(item.link!);
                    const content = load(res);
                    item.description = content('#vsb_content').html()! + (content('form ul').length > 0 ? content('form ul').html() : '');
                    return item;
                } catch (error) {
                    logger.error(`Fetch failed for ${item.link}:`, error);
                    return item;
                }
            })
        )
    );
    return {
        title: '西安交通大学研究生招生信息网',
        link: 'https://yz.xjtu.edu.cn',
        item: items,
    } as Data;
}
