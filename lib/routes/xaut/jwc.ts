import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc/:category?',
    categories: ['university'],
    example: '/xaut/jwc/tzgg',
    parameters: { category: '通知类别，默认为通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '教务处',
    maintainers: ['mocusez'],
    handler,
    description: `::: warning
有些内容需使用校园网或 VPN 访问知行网获取
:::

| 通知公告 | 新闻动态 | 规章制度 | 竞赛结果公示 | 竞赛获奖通知 | 竞赛信息 | 公开公示 |
| :------: | :------: | :------: | :----------: | :----------: | :------: | :------: |
|   tzgg   |   xwdt   |   gzzd   |     jggs     |     jsjg     |   jsxx   |   gkgs   |`,
};
async function fetchDetail(link: string): Promise<Pick<DataItem, 'description' | 'author'>> {
    if (!link.includes('zhixing.xaut.edu.cn') && !link.includes('xinwen.xaut.edu.cn')) {
        const response = await got(link);
        const content = load(response.body);
        return {
            description: content('[id^="vsb_content"]').first().html() ?? undefined,
            author:
                content('.main_contit p')
                    .text()
                    .match(/作者：(\S*)/)?.[1] || undefined,
        };
    }
    return {};
}
async function handler(ctx) {
    let category = ctx.req.param('category');
    const rootUrl = 'http://jwc.xaut.edu.cn/';
    const categoryPaths = { tzgg: 'tzgg.htm', xwdt: 'xwdt.htm', gzzd: 'gzzd.htm', jggs: 'xkjs/jggs.htm', jsjg: 'xkjs/jsjg.htm', jsxx: 'xkjs/jsxx.htm', gkgs: 'gkgs.htm' };
    const categoryTitles = { tzgg: '通知公告', xwdt: '新闻动态', gzzd: '规章制度', jggs: '竞赛结果公示', jsjg: '竞赛获奖通知', jsxx: '竞赛信息', gkgs: '公开公示' };
    if (categoryTitles[category] === undefined) {
        category = 'tzgg';
    }
    const response = await got({
        method: 'get',
        url: rootUrl + categoryPaths[category],
    });
    const data = response.body;
    const $ = load(data);
    const list = $('.main_conRCb a')
        .slice(0, 20)
        .toArray()
        .filter((item) => $(item).attr('href'))
        .map((item): DataItem => {
            const $item = $(item);
            const link = new URL($item.attr('href')!, rootUrl + categoryPaths[category]).href;
            const rawDate = $item.find('span').text();
            const pubDate = rawDate ? timezone(parseDate(rawDate, 'YYYY-MM-DD', true), 8) : undefined;
            return {
                title: $item.find('em').text(),
                link,
                pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
            };
        });
    return {
        title: '西安理工大学教务处-' + categoryTitles[category],
        link: rootUrl,
        description: '西安理工大学教务处-' + categoryTitles[category],
        item: await pMap(
            list,
            async (item) => {
                const detail = await cache.tryGet(`xaut:jwc:detail:v4:${item.link}`, () => fetchDetail(item.link!));
                return { ...item, description: detail.description, author: detail.author };
            },
            { concurrency: 3, stopOnError: false }
        ),
    };
}
