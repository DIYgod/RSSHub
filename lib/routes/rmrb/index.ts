import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { getArticleContent, getArticles, getEditions } from './utils';

export const route: Route = {
    path: ['/:page?', '/:page?/:date?'],
    name: '人民日报',
    url: 'paper.people.com.cn',
    maintainers: ['zhangsan-xyz'],
    example: '/rmrb/05',
    description: '抓取人民日报电子版指定版面或当日全部版面的文章。版面编号可在报纸首页查看，例如 `05` 为评论版、`09` 为理论版；`all` 表示当日全部版面。',
    parameters: {
        page: {
            description: '版面编号（1-2 位数字），默认 `01`（第01版 要闻）。例如 `05` 为评论版，`09` 为理论版，`11` 为国际版。`all` 表示抓取当日全部版面。',
            default: '01',
        },
        date: '指定日期，格式 `YYYYMMDD`，默认抓取最新一期。例如 `/rmrb/05/20260701` 抓取评论版、`/rmrb/all/20260701` 抓取当日全部版面。',
    },
    categories: ['traditional-media'],
    zh: {
        name: '人民日报',
        description: '抓取人民日报电子版指定版面或当日全部版面的文章。版面编号可在报纸首页查看，例如 `05` 为评论版、`09` 为理论版；`all` 表示当日全部版面。',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['paper.people.com.cn/rmrb/pc/layout/index.html'],
            target: '/:page',
        },
    ],
    handler,
};

interface ArticleRef {
    title: string;
    link: string;
}

async function handler(ctx) {
    const page = ctx.req.param('page');
    const date = ctx.req.param('date');
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30;

    if (date && !/^\d{8}$/.test(date)) {
        throw new InvalidParameterError('date 参数格式应为 YYYYMMDD');
    }

    // page 语义：undefined -> 第01版；'all' -> 全部版面；数字 -> 对应版面
    let pageNum: string | null = null;
    let isAll = false;
    if (page === undefined) {
        pageNum = '01';
    } else if (page === 'all') {
        isAll = true;
    } else if (/^\d{1,2}$/.test(page)) {
        pageNum = page;
    } else {
        throw new InvalidParameterError(`版面编号应为 1-2 位数字或 "all"，收到：${page}`);
    }

    const editionDate = date ? `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}` : '';

    if (isAll) {
        const editions = await getEditions(date);
        const matched = editions[0]?.url.match(/layout\/(\d{4})(\d{2})\/(\d{2})\//);
        const resolvedDate = matched ? `${matched[1]}-${matched[2]}-${matched[3]}` : editionDate;

        const allArticles = (await Promise.all(editions.map((edition) => getArticles(edition.url)))).flat();
        const items = await buildItems(allArticles.slice(0, limit), resolvedDate);
        return {
            title: '人民日报 - 全部版面',
            link: 'http://paper.people.com.cn/rmrb/pc/layout/index.html',
            description: `人民日报电子版 ${resolvedDate || '最新一期'} 全部版面`,
            item: items,
        };
    }

    // 指定版面
    const pageToUse = pageNum ?? '01';
    let nodeUrl: string;
    let resolvedDate: string;
    if (date) {
        const y = date.slice(0, 4);
        const m = date.slice(4, 6);
        const d = date.slice(6, 8);
        nodeUrl = `http://paper.people.com.cn/rmrb/pc/layout/${y}${m}/${d}/node_${pageToUse}.html`;
        resolvedDate = editionDate;
    } else {
        const indexUrl = 'http://paper.people.com.cn/rmrb/pc/layout/index.html';
        const indexHtml = await ofetch(indexUrl);
        const $index = load(indexHtml);
        const href = $index(`#list li a[href$="node_${pageToUse}.html"]`).attr('href');
        if (!href) {
            throw new InvalidParameterError(`未找到第 ${pageToUse} 版，请确认版面编号是否正确`);
        }
        nodeUrl = new URL(href, indexUrl).href;
        const matched = nodeUrl.match(/layout\/(\d{4})(\d{2})\/(\d{2})\//);
        resolvedDate = matched ? `${matched[1]}-${matched[2]}-${matched[3]}` : '';
    }

    const articles = await getArticles(nodeUrl);
    const items = await buildItems(articles.slice(0, limit), resolvedDate);

    const nodeHtml = await ofetch(nodeUrl);
    const $node = load(nodeHtml);
    const editionName = $node(`#list li a[href$="node_${pageToUse}.html"]`).text().replaceAll(/\s+/g, ' ').trim() || `第${pageToUse}版`;

    return {
        title: `人民日报 - ${editionName}`,
        link: nodeUrl,
        description: `人民日报电子版 ${resolvedDate} ${editionName}`,
        item: items,
    };
}

function buildItems(articles: ArticleRef[], editionDate: string) {
    return Promise.all(
        articles.map((article) =>
            cache.tryGet(article.link, async () => {
                const { description, pubDate } = await getArticleContent(article.link);
                return {
                    title: article.title,
                    link: article.link,
                    description,
                    pubDate: pubDate ?? parseDate(editionDate || new Date()),
                };
            })
        )
    );
}
