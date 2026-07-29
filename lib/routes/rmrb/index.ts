import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

import { type ArticleRef, getArticleContent, getArticles, getEditions } from './utils';

export const route: Route = {
    path: '/:page?',
    name: '版面',
    url: 'paper.people.com.cn',
    maintainers: ['zhangsan-xyz'],
    example: '/rmrb/05',
    description: '抓取人民日报电子版最新一期的指定版面或当日全部版面文章。版面编号可在报纸首页查看，例如 `05` 为评论版、`09` 为理论版；`all` 表示当日全部版面。',
    parameters: {
        page: {
            description: '版面编号（1-2 位数字），默认 `01`（第01版 要闻）。例如 `05` 为评论版，`09` 为理论版，`11` 为国际版。`all` 表示抓取当日全部版面。',
            default: '01',
        },
    },
    categories: ['traditional-media'],
    zh: {
        name: '版面',
        description: '抓取人民日报电子版最新一期的指定版面或当日全部版面文章。版面编号可在报纸首页查看，例如 `05` 为评论版、`09` 为理论版；`all` 表示当日全部版面。',
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
            target: '/',
        },
    ],
    handler,
};

async function handler(ctx) {
    const page = ctx.req.param('page');

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

    const editions = await getEditions();
    const matched = editions[0]?.url.match(/layout\/(\d{4})(\d{2})\/(\d{2})\//);
    const resolvedDate = matched ? `${matched[1]}-${matched[2]}-${matched[3]}` : '';

    if (isAll) {
        const allArticles = (await Promise.all(editions.map((edition) => getArticles(edition.url)))).flat();
        const items = await buildItems(allArticles, resolvedDate);
        return {
            title: '人民日报 - 全部版面',
            link: 'https://paper.people.com.cn/rmrb/pc/layout/index.html',
            description: `人民日报电子版 ${resolvedDate || '最新一期'} 全部版面`,
            item: items,
        };
    }

    const pageToUse = pageNum ?? '01';
    const target = editions.find((e) => e.page === pageToUse) ?? editions.find((e) => Number(e.page) === Number(pageToUse));
    if (!target) {
        throw new InvalidParameterError(`未找到第 ${pageToUse} 版，请确认版面编号是否正确`);
    }
    const articles = await getArticles(target.url);
    const items = await buildItems(articles, resolvedDate);
    const editionName = target.name || `第${pageToUse}版`;

    return {
        title: `人民日报 - ${editionName}`,
        link: target.url,
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
                    pubDate: pubDate ?? (editionDate ? parseDate(editionDate, 'YYYY-MM-DD') : undefined),
                };
            })
        )
    );
}
