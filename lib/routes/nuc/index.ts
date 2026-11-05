import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
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
            list: '.news-txt, body > div.list > div.list_con > div.list_con_rightlist > ul > li',
            title: '.content > h3.title, body > div.list > div.list_con > form > div > h2',
            date: '.art-itro span:nth-child(3), body > div.list > div.list_con > form > div > div:nth-child(4)',
            content: '.v_news_content, body > div.list > div.list_con > form > div > div:nth-child(6)',
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
    if (!Object.hasOwn(types, type)) {
        throw new InvalidParameterError(`Unsupported news type: ${type}`);
    }
    const typeConfig = config[type] ?? config.other;

    const pageUrl = `${typeConfig.basePath}index/${type}.htm`;
    const response = await ofetch(pageUrl, { allowH2: false });
    const $ = load(response);

    const articleUrls = $(typeConfig.selector.list)
        .toArray()
        .flatMap((item): string[] => {
            const $item = $(item);
            const anchor = $item.is('a') ? $item : $item.find('a').first();
            const href = anchor.attr('href');
            return href ? [new URL(href, pageUrl).href] : [];
        });
    const items = await pMap(
        articleUrls,
        (articleUrl) =>
            cache.tryGet(articleUrl, async () => {
                const response = await ofetch(articleUrl, { allowH2: false });
                const $ = load(response);

                const dateText = $(typeConfig.selector.date)
                    .text()
                    .match(/\d{4}[-/年]\d{1,2}[-/月]\d{1,2}/)?.[0]
                    .replaceAll(/[年月]/g, '/');
                const description = $(typeConfig.selector.content).first().html();
                if (!description) {
                    throw new Error(`Article content was not found: ${articleUrl}`);
                }

                return {
                    title: $(typeConfig.selector.title).first().text(),
                    link: articleUrl,
                    description: description.replaceAll('/__local', 'http://www.nuc.edu.cn/__local'),
                    pubDate: dateText ? timezone(parseDate(dateText), 8) : undefined,
                };
            }),
        { concurrency: 3 }
    );

    return {
        title: `${types[type].name} - 中北大学`,
        link: types[type].url,
        description: `${types[type].name} - 中北大学`,
        item: items,
    };
}
