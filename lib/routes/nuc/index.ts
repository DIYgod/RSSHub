import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const types = {
    zbxw: {
        name: '中北新闻',
        url: 'http://www.nuc.edu.cn/index/zbxw.htm',
    },
    tzgg: {
        name: '通知公告',
        url: 'http://www.nuc.edu.cn/index/tzgg.htm',
    },
    xshd: {
        name: '学术活动',
        url: 'http://www.nuc.edu.cn/index/xshd.htm',
    },
    jwtz: {
        name: '教务通知',
        url: 'http://jwc.nuc.edu.cn/index/jwtz.htm',
    },
};

const config = {
    jwtz: {
        selector: {
            list: '.winstyle54561 > tbody > tr > td > a',
            title: 'body > center > table:nth-child(2) > tbody > tr > td.bk > table > tbody > tr:nth-child(2) > td > form > div > p:nth-child(1) > span',
            date: 'body > center > table:nth-child(2) > tbody > tr > td.bk > table > tbody > tr:nth-child(2) > td > form > div > div:nth-child(2) > span.c205277_date',
            content: '#vsb_content',
        },
        basePath: 'http://jwc.nuc.edu.cn/',
    },
    other: {
        selector: {
            list: 'body > div.list > div.list_con > div.list_con_rightlist > ul > li',
            title: 'body > div.list > div.list_con > form > div > h2',
            date: 'body > div.list > div.list_con > form > div > div:nth-child(4)',
            content: 'body > div.list > div.list_con > form > div > div:nth-child(6)',
        },
        basePath: 'http://www.nuc.edu.cn/',
    },
};

export const route: Route = {
    path: '/:type',
    categories: ['university'],
    example: '/nuc/zbxw',
    parameters: { type: '分类，见下表' },
    name: '各种新闻通知',
    maintainers: ['Dreace'],
    handler,
    description: `| 中北新闻 | 通知公告 | 学术活动 | 教务通知 |
| -------- | -------- | -------- | -------- |
| zbxw     | tzgg     | xshd     | jwtz     |`,
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const typeConfig = config[type] ?? config.other;

    const pageUrl = `${typeConfig.basePath}index/${type}.htm`;
    const response = await ofetch(pageUrl);
    const $ = load(response);

    const items = await Promise.all(
        $(typeConfig.selector.list)
            .toArray()
            .map((item) => {
                const $li = load(item);
                const articleUrl = new URL($li('a').attr('href')!, pageUrl).href;

                return cache.tryGet(articleUrl, async () => {
                    const response = await ofetch(articleUrl);
                    const $ = load(response);

                    const dateText = $(typeConfig.selector.date)
                        .text()
                        .split(' '.repeat(4), 1)[0]
                        .replace(/时间：/, '')
                        .replaceAll(/[年日月]/g, '/')
                        .trim();

                    return {
                        title: $(typeConfig.selector.title).text(),
                        link: articleUrl,
                        description: $(typeConfig.selector.content).html()!.replaceAll('/__local', 'http://www.nuc.edu.cn/__local'),
                        pubDate: timezone(parseDate(dateText), 8),
                    };
                });
            })
    );

    return {
        title: `${types[type].name} - 中北大学`,
        link: types[type].url,
        description: `${types[type].name} - 中北大学`,
        item: items,
    };
}
