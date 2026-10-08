import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { finishArticleItem } from '@/utils/wechat-mp';

const rootUrl = 'https://www.chinanzxh.com';
const categories = {
    'price-indices': '价格指数',
    'index-analysis': '指数分析',
};

export const route: Route = {
    path: '/data/:category?',
    categories: ['finance'],
    example: '/chinanzxh/data/price-indices',
    name: '化肥价格指数与分析',
    maintainers: ['DIYgod'],
    parameters: {
        category: {
            description: '数据中心栏目。',
            default: 'price-indices',
            options: Object.entries(categories).map(([value, label]) => ({ value, label })),
        },
    },
    description: '收录各类化肥的价格指数周报与市场分析全文。指数分析文章来自微信公众号；若微信临时限制访问，订阅会报错，请稍后重试。',
    radar: [
        { source: ['www.chinanzxh.com/data/price-indices/index.html'], target: '/data/price-indices' },
        { source: ['www.chinanzxh.com/data/index-analysis/index.html'], target: '/data/index-analysis' },
    ],
    handler,
};

function getArticle(item: DataItem) {
    if (new URL(item.link!).hostname === 'mp.weixin.qq.com') {
        return finishArticleItem(item);
    }
    return cache.tryGet(item.link!, async () => {
        const response = await ofetch(item.link!);
        const $ = load(response);
        const article = $('article.article').first();
        if (!article.length) {
            throw new Error(`No article content found at ${item.link}.`);
        }
        article.find('[src], a[href]').each((_, element) => {
            const node = $(element);
            const attribute = node.is('a') ? 'href' : 'src';
            const value = node.attr(attribute);
            if (value) {
                node.attr(attribute, new URL(value, item.link).href);
            }
        });
        return {
            ...item,
            description: article.html()!,
            author: $('.author span').first().text().trim() || undefined,
        };
    });
}

async function handler(ctx): Promise<Data> {
    const category = ctx.req.param('category') ?? 'price-indices';
    if (!Object.hasOwn(categories, category)) {
        throw new InvalidParameterError('栏目必须为 price-indices（价格指数）或 index-analysis（指数分析）。');
    }
    const link = `${rootUrl}/data/${category}/index.html`;
    const response = await ofetch(link);
    const $ = load(response);
    const requestedLimit = Number.parseInt(ctx.req.query('limit') ?? '');
    const items = $('.static-news-list li')
        .toArray()
        .slice(0, requestedLimit > 0 ? requestedLimit : undefined)
        .map((element): DataItem => {
            const node = $(element);
            const anchor = node.find('a[href]').first();
            const date = node.find('time').text();
            return {
                title: anchor.text(),
                link: new URL(anchor.attr('href')!, rootUrl).href,
                pubDate: date ? timezone(parseDate(date, 'YYYY-MM-DD'), 8) : undefined,
            };
        });

    return {
        title: `中国农资流通协会 - ${categories[category]}`,
        link,
        language: 'zh-CN',
        item: await pMap(items, getArticle, { concurrency: 3 }),
    };
}
