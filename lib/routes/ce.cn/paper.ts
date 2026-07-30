import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const ROOT = 'http://paper.ce.cn/pc/layout';

interface Edition {
    /** Page number, e.g. `01` */
    page: string;
    /** Page name, e.g. `第01版 要闻` */
    name: string;
    /** Absolute URL of the page */
    url: string;
}

interface ArticleRef {
    title: string;
    link: string;
}

/** Fetch the list of all editions (pages) of the latest issue. */
export async function getEditions(): Promise<Edition[]> {
    const indexUrl = `${ROOT}/index.html`;
    const html = await ofetch(indexUrl);
    const $ = load(html);

    const editions: Edition[] = [];
    $('#list li a').each((_, el) => {
        const a = $(el);
        const href = a.attr('href');
        if (!href || !/node_\d+\.html$/.test(href)) {
            return;
        }
        const pageMatch = href.match(/node_(\d+)\.html$/);
        editions.push({
            page: pageMatch ? pageMatch[1] : '',
            name: a.text().replaceAll(/\s+/g, ' ').trim(),
            url: new URL(href, indexUrl).href,
        });
    });
    return editions;
}

/**
 * Extract article links from the `.newsList` container of a page.
 * NOTE: editorial-credit entries (本版责编) share the exact same DOM as articles
 * (li > a, href also content_xxx.html), so a minimal title guard is applied.
 */
export async function getArticles(nodeUrl: string): Promise<ArticleRef[]> {
    const html = await ofetch(nodeUrl);
    const $ = load(html);

    const articles: ArticleRef[] = [];
    $('.newsList a').each((_, el) => {
        const a = $(el);
        const href = a.attr('href');
        if (!href || !/content_\d+\.html$/.test(href)) {
            return;
        }
        const title = a.text().replaceAll(/\s+/g, ' ').trim();
        if (!title || /责编|责任编辑/.test(title)) {
            return;
        }
        articles.push({
            title,
            link: new URL(href, nodeUrl).href,
        });
    });
    return articles;
}

/** Fetch an article's body (scoped to the content region) and its metadata. */
export async function getArticleContent(articleUrl: string): Promise<{ description: string; pubDate?: Date; author?: string }> {
    const html = await ofetch(articleUrl);
    const $ = load(html);

    // Scope the feed body to the real content region `#ozoom`; fall back to `.detail-art`.
    const $content = $('#ozoom').length ? $('#ozoom') : $('.detail-art');
    $content.find('img[src]').each((_, el) => {
        const img = $(el);
        const src = img.attr('src');
        if (src) {
            img.attr('src', new URL(src, articleUrl).href);
        }
    });
    const description = $content.html()?.trim() ?? '';

    // The byline (author) is inside `#Author` (often empty for this paper).
    const author = $('#Author').text().replaceAll(/\s+/g, ' ').trim() || undefined;

    // Parse the publication date from the hidden `<!--enpproperty <date>YYYY-MM-DD...-->` marker.
    const dateMatch = html.match(/<date>(\d{4})-(\d{2})-(\d{2})/);
    const pubDate = dateMatch
        ? timezone(parseDate(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`, 'YYYY-MM-DD'), 8)
        : undefined;

    return { description, pubDate, author };
}

export const route: Route = {
    path: '/paper/:page?',
    name: '经济日报',
    url: 'paper.ce.cn',
    maintainers: ['zhangsan-xyz'],
    example: '/ce.cn/paper/01',
    description: '抓取经济日报电子版最新一期的指定版面或当日全部版面文章。版面编号可在报纸首页查看，例如 `01` 为要闻版、`05` 为时评版、`07` 为财金版；`all` 表示当日全部版面。',
    parameters: {
        page: {
            description: '版面编号（1-2 位数字），默认 `01`（第01版 要闻）。例如 `01` 为要闻版，`05` 为时评版，`07` 为财金版，`10` 为理论版。`all` 表示抓取当日全部版面。',
            default: '01',
        },
    },
    categories: ['traditional-media'],
    zh: {
        name: '经济日报',
        description: '抓取经济日报电子版最新一期的指定版面或当日全部版面文章。版面编号可在报纸首页查看，例如 `01` 为要闻版、`05` 为时评版、`07` 为财金版；`all` 表示当日全部版面。',
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
            source: ['paper.ce.cn/pc/layout/index.html', 'paper.ce.cn/pc/layout/*/node_*.html'],
            target: '/paper/:page?',
        },
    ],
    handler,
};

async function handler(ctx) {
    const page = ctx.req.param('page');

    // page semantics: undefined -> page 01; 'all' -> all pages; digits -> that page.
    let pageNum = '01';
    let isAll = false;
    if (page === 'all') {
        isAll = true;
    } else if (/^\d{1,2}$/.test(page)) {
        pageNum = page;
    } else if (page !== undefined) {
        throw new Error(`版面编号应为 1-2 位数字或 "all"，收到：${page}`);
    }

    const editions = await getEditions();
    const matched = editions[0]?.url.match(/layout\/(\d{4})(\d{2})\/(\d{2})\//);
    const resolvedDate = matched ? `${matched[1]}-${matched[2]}-${matched[3]}` : '';

    if (isAll) {
        const allArticles = (await Promise.all(editions.map((edition) => getArticles(edition.url)))).flat();
        const items = await buildItems(allArticles, resolvedDate);
        return {
            title: '经济日报 - 全部版面',
            link: 'http://paper.ce.cn/pc/layout/index.html',
            description: `经济日报电子版 ${resolvedDate || '最新一期'} 全部版面`,
            item: items,
        };
    }

    const target = editions.find((e) => Number(e.page) === Number(pageNum));
    if (!target) {
        throw new Error(`未找到第 ${pageNum} 版，请确认版面编号是否正确`);
    }
    const articles = await getArticles(target.url);
    const items = await buildItems(articles, resolvedDate);
    const editionName = target.name || `第${pageNum}版`;

    return {
        title: `经济日报 - ${editionName}`,
        link: target.url,
        description: `经济日报电子版 ${resolvedDate} ${editionName}`,
        item: items,
    };
}

function buildItems(articles: ArticleRef[], editionDate: string) {
    return Promise.all(
        articles.map((article) =>
            cache.tryGet(article.link, async () => {
                const { description, pubDate, author } = await getArticleContent(article.link);
                return {
                    title: article.title,
                    link: article.link,
                    description,
                    author,
                    pubDate: pubDate ?? (editionDate ? timezone(parseDate(editionDate, 'YYYY-MM-DD'), 8) : undefined),
                };
            })
        )
    );
}
