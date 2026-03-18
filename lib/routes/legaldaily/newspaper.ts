import type { Cheerio, Element } from 'cheerio';
import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

type Page = {
    title: string;
    link: string;
};

type Article = {
    title: string;
    link: string;
    category: string[];
    issueDate: string;
};

const rootUrl = 'http://epaper.legaldaily.com.cn';
const rootPageUrl = rootUrl + '/fzrb/content/PaperIndex.htm';

const fetchPage = (url: string) =>
    ofetch<string, 'text'>(url, {
        responseType: 'text',
        headers: {
            'User-Agent': config.trueUA,
        },
    });

const normalizeText = (value: string) => value.replaceAll(/\s+/g, ' ').trim();

const extractMetaRefreshPath = (html: string, errorMessage: string) => {
    const $ = load(html);
    const refreshContent = $('meta[http-equiv="REFRESH"], meta[http-equiv="refresh"]').attr('content');
    const refreshPath = refreshContent?.match(/URL=(.+)$/i)?.[1]?.trim() ?? html.match(/URL=([^"' >]+)/i)?.[1]?.trim();

    if (!refreshPath) {
        throw new Error(errorMessage);
    }

    return refreshPath;
};

const extractIssueDate = (path: string) => {
    const match = path.match(/(\d{4})(\d{2})(\d{2})/);

    if (!match) {
        throw new Error('无法从法治日报电子报首页识别最新刊期日期，请稍后重试。');
    }

    return `${match[1]}-${match[2]}-${match[3]}`;
};

const resolveRelativeUrl = (url: string, baseUrl: string) => {
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('mailto:') || url.startsWith('javascript:') || url.startsWith('#')) {
        return url;
    }

    return new URL(url, baseUrl).href;
};

const resolveRelativeLinks = ($: ReturnType<typeof load>, content: Cheerio<Element>, baseUrl: string) => {
    content.find('img').each((_, element) => {
        const item = $(element);
        const src = item.attr('src');

        if (src) {
            item.attr('src', resolveRelativeUrl(src, baseUrl));
        }
    });

    content.find('a').each((_, element) => {
        const item = $(element);
        const href = item.attr('href');

        if (href) {
            item.attr('href', resolveRelativeUrl(href, baseUrl));
        }
    });
};

const extractContainerHtml = ($: ReturnType<typeof load>, selector: string, baseUrl: string) => {
    const content = $(selector).first();

    if (!content.length) {
        return;
    }

    resolveRelativeLinks($, content, baseUrl);

    const hasMeaningfulText = normalizeText(content.text()).length > 0;
    const hasMedia = content.find('img, audio, video, iframe').length > 0;

    if (!hasMeaningfulText && !hasMedia) {
        return;
    }

    const html = content.html()?.trim();

    return html || undefined;
};

const parsePageList = ($: ReturnType<typeof load>, baseUrl: string): Page[] => {
    const seenLinks = new Set<string>();

    return $('.banlist-li a[href^="Page"]')
        .toArray()
        .map((element) => {
            const item = $(element);
            const href = item.attr('href');
            const title = normalizeText(item.text()).replace(/^第\s+/, '第');

            if (!href || !title) {
                return null;
            }

            const link = new URL(href, baseUrl).href;

            if (seenLinks.has(link)) {
                return null;
            }

            seenLinks.add(link);

            return {
                title,
                link,
            };
        })
        .filter((page): page is Page => page !== null);
};

const parseArticleList = ($: ReturnType<typeof load>, baseUrl: string, category: string[], issueDate: string): Article[] => {
    const seenLinks = new Set<string>();

    return $('.newslist a[href^="Articel"]')
        .toArray()
        .map((element) => {
            const item = $(element);
            const href = item.attr('href');
            const title = normalizeText(item.text());

            if (!href || !title) {
                return null;
            }

            const link = new URL(href, baseUrl).href;

            if (seenLinks.has(link)) {
                return null;
            }

            seenLinks.add(link);

            return {
                title,
                link,
                category,
                issueDate,
            };
        })
        .filter((article): article is Article => article !== null);
};

const extractDetail = (html: string, baseUrl: string, fallbackTitle: string, issueDate: string, category: string[]) => {
    const $ = load(html);
    const title = normalizeText($('.xha-view-title h1').first().text()) || fallbackTitle;
    const descriptionFragments = [extractContainerHtml($, '.imagelist', baseUrl), extractContainerHtml($, '#article_view_content', baseUrl)].filter((fragment): fragment is string => !!fragment);

    return {
        title,
        ...(descriptionFragments.length ? { description: descriptionFragments.join('<br>') } : {}),
        pubDate: timezone(parseDate(issueDate, 'YYYY-MM-DD'), +8),
        category,
    };
};

async function handler(ctx) {
    const rootHtml = await fetchPage(rootPageUrl);
    const issuePath = extractMetaRefreshPath(rootHtml, '无法从法治日报电子报首页识别最新刊期，请稍后重试。');
    const issueDate = extractIssueDate(issuePath);
    const issueUrl = new URL(issuePath, rootPageUrl).href;
    const issueHtml = await fetchPage(issueUrl);
    const firstPagePath = extractMetaRefreshPath(issueHtml, `无法从最新刊期（${issueDate}）入口识别第一页，请稍后重试。`);
    const firstPageUrl = new URL(firstPagePath, issueUrl).href;
    const firstPageHtml = await fetchPage(firstPageUrl);
    const firstPage = load(firstPageHtml);
    const pages = parsePageList(firstPage, firstPageUrl);

    if (!pages.length) {
        throw new Error(`未找到最新刊期（${issueDate}）的版面列表，请稍后重试。`);
    }

    const pageArticles = await pMap(
        pages,
        async (page) => {
            const pageHtml = page.link === firstPageUrl ? firstPageHtml : await cache.tryGet(page.link, () => fetchPage(page.link));
            const $ = load(pageHtml);

            return parseArticleList($, page.link, [page.title], issueDate);
        },
        { concurrency: 4 }
    );

    const seenLinks = new Set<string>();
    const uniqueArticles = pageArticles.flat().filter((article) => {
        if (seenLinks.has(article.link)) {
            return false;
        }

        seenLinks.add(article.link);
        return true;
    });

    const limit = Number.parseInt(ctx.req.query('limit') ?? '', 10);
    const articlesToFetch = Number.isNaN(limit) ? uniqueArticles : uniqueArticles.slice(0, limit);
    const items = await pMap(
        articlesToFetch,
        (article) =>
            cache.tryGet(article.link, async () => {
                const detailHtml = await fetchPage(article.link);

                return {
                    link: article.link,
                    ...extractDetail(detailHtml, article.link, article.title, article.issueDate, article.category),
                };
            }),
        { concurrency: 4 }
    );

    return {
        title: `法治日报数字报 - ${issueDate}`,
        link: firstPageUrl,
        description: '法治日报数字报最新一期全部版面文章',
        item: items,
    };
}

export const route: Route = {
    path: '/newspaper',
    categories: ['traditional-media'],
    example: '/legaldaily/newspaper',
    radar: [
        {
            source: ['epaper.legaldaily.com.cn/fzrb/content/PaperIndex.htm'],
            target: '/newspaper',
        },
    ],
    name: '数字报',
    maintainers: ['ZHA30'],
    handler,
    url: 'epaper.legaldaily.com.cn/fzrb/content/PaperIndex.htm',
    description: '抓取法治日报数字报最新一期全部版面文章。',
};
