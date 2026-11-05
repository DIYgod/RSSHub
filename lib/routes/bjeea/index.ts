import { load } from 'cheerio';
import type { Context } from 'hono';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import NotFoundError from '@/errors/types/not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:type',
    categories: ['government'],
    example: '/bjeea/bjeeagg',
    parameters: { type: '分类名' },
    radar: [
        {
            source: ['www.bjeea.cn/html/bjeeagg/:path?', 'www.bjeea.cn/html/bjeeagg'],
            target: '/bjeeagg',
        },
        {
            source: ['www.bjeea.cn/html/zkzc/:path?', 'www.bjeea.cn/html/zkzc'],
            target: '/zkzc',
        },
        {
            source: ['www.bjeea.cn/html/zkkd/:path?', 'www.bjeea.cn/html/zkkd'],
            target: '/zkkd',
        },
    ],
    name: '通知公告',
    maintainers: ['gavin-k'],
    handler,
    description: `| 通知公告 | 招考政策 | 自考快递 |
| :------: | :------: | :------: |
|  bjeeagg |   zkzc   |   zkkd   |`,
};

const baseUrl = 'https://www.bjeea.cn/';
const siteTitle = '北京教育考试院--';

const categoryMap = {
    bjeeagg: { title: '首页 / 通知公告', suffix: 'html/bjeeagg' },
    zkzc: { title: '首页 / 招考政策', suffix: 'html/zkzc' },
    zkkd: { title: '首页 / 自考快递', suffix: 'html/zkkd' },
};

async function getArticle(item: DataItem & { link: string }) {
    if (!item.link.startsWith(baseUrl)) {
        return item;
    }
    try {
        const description = await cache.tryGet(`bjeea:article:${item.link}`, async () => {
            const response = await ofetch(item.link);
            const content = load(response)('div.info-txt').html();
            if (!content) {
                throw new NotFoundError('The source did not provide article content.');
            }
            return content;
        });
        return { ...item, description };
    } catch (error) {
        if (error instanceof FetchError || error instanceof NotFoundError) {
            return item;
        }
        throw error;
    }
}

async function handler(ctx: Context) {
    const { type = 'bjeeagg' } = ctx.req.param();
    if (!Object.hasOwn(categoryMap, type)) {
        throw new InvalidParameterError(`Unknown category: ${type}. Available categories: ${Object.keys(categoryMap).join(', ')}.`);
    }

    const listPageUrl = baseUrl + categoryMap[type].suffix;
    const response = await ofetch(listPageUrl);
    const $ = load(response);

    const list = $('ul.com-list>li')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const title = $item.find('a').text();
            const link = new URL($item.find('a').attr('href')!, baseUrl).href;
            return {
                title,
                pubDate: timezone(parseDate($item.find('span').text()), 8),
                link,
                guid: link,
            };
        });

    const result = await pMap(list, getArticle, { concurrency: 6, stopOnError: false });

    return {
        title: siteTitle + categoryMap[type].title,
        link: baseUrl,
        description: siteTitle + categoryMap[type].title,
        item: result,
    };
}
