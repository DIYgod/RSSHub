import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://yz.chsi.com.cn';

export const route: Route = {
    path: '/kyzx/:type',
    categories: ['study'],
    example: '/chsi/kyzx/fstj',
    parameters: { type: ' type 见下表，亦可在网站 URL 找到' },
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
            source: ['yz.chsi.com.cn/kyzx/:type'],
        },
    ],
    name: '考研资讯',
    maintainers: ['yanbot-team'],
    handler,
    description: `| \`:type\` | 专题名称 |
| ------- | -------- |
| fstj    | 复试调剂 |
| kydt    | 考研动态 |
| zcdh    | 政策导航 |
| kyrw    | 考研人物 |
| jyxd    | 经验心得 |`,
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const response = await got(`${host}/kyzx/${type}`);
    const $ = load(response.data);
    const typeName = $('.bread-nav .location a').last().text() || '考研资讯';
    const list = $('ul.news-list').children();
    const candidates = list.toArray().map((element) => {
        const $item = $(element);
        const path = $item.find('a').attr('href')!;
        return {
            title: $item.find('a').text(),
            link: new URL(path, host).href,
            path,
            pubDate: timezone(parseDate($item.find('.span-time, .time').first().text()), 8),
        };
    });
    const ordered = candidates;
    const selected = ordered;
    const items = await Promise.all(
        selected.map((item) =>
            cache.tryGet(item.link, async () => {
                const result = await got(item.link);
                const $ = load(result.data);
                const description = $('#article_dnull').html()!.trim();
                return {
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    description,
                };
            })
        )
    );

    return {
        title: `中国研究生招生信息网 - ${typeName}`,
        link: `${host}/kyzx/${type}/`,
        description: `中国研究生招生信息网 - ${typeName}`,
        item: items,
    };
}
