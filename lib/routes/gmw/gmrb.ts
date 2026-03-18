import type { Cheerio, Element } from 'cheerio';
import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://epaper.gmw.cn';
const rootPageUrl = `${rootUrl}/gmrb/html/layout/index.html`;

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

const fetchPage = (url: string) =>
    ofetch<string, 'text'>(url, {
        responseType: 'text',
        headers: {
            'User-Agent': config.trueUA,
        },
    });

const normalizeText = (text?: string) => text?.replaceAll(/\s+/g, ' ').trim() ?? '';

const normalizeEditionTitle = (title: string) => {
    const normalizedTitle = normalizeText(title);
    const matched = normalizedTitle.match(/^(第\d+版)\s*[:：]?\s*(.*)$/);

    if (!matched) {
        return normalizedTitle;
    }

    const [, edition, name] = matched;
    return name ? `${edition}：${name}` : edition;
};

const resolveRelativeUrl = (url: string, baseUrl: string) => {
    if (url.startsWith('data:') || url.startsWith('mailto:') || url.startsWith('javascript:') || url.startsWith('#')) {
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

const extractPropertyField = (html: string, field: string) => {
    const matched = html.match(new RegExp(`<${field}>\\s*([\\s\\S]*?)\\s*<\\/${field}>`, 'i'));

    return normalizeText(matched?.[1]);
};

const extractIssueDate = (pageLink: string) => {
    const matched = pageLink.match(/\/html\/layout\/(\d{4})(\d{2})\/(\d{2})\//);

    if (!matched) {
        throw new Error('无法从电子报首页识别最新刊期日期，请稍后重试。');
    }

    return `${matched[1]}-${matched[2]}-${matched[3]}`;
};

const parsePageList = ($: ReturnType<typeof load>, baseUrl: string): Page[] => {
    const seenLinks = new Set<string>();

    return $('#list a[href*="node_"]')
        .toArray()
        .map((element) => {
            const item = $(element);
            const href = item.attr('href');
            const title = normalizeEditionTitle(item.text());

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

    return $('.m-title-list a[href*="content_"]')
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

const extractDetail = (html: string, baseUrl: string, fallbackTitle: string, fallbackDate: string, category: string[]) => {
    const $ = load(html);
    const title = normalizeText($('.m-article-content h1').first().text()) || fallbackTitle;
    const content = $('.m-article-main').first();

    content.find('script, style').remove();
    resolveRelativeLinks($, content, baseUrl);

    const description =
        content
            .html()
            ?.replaceAll(/<!--[\s\S]*?-->/g, '')
            .trim() || undefined;
    const author = normalizeText($('.m-article-author').first().text()).replace(/^作者[:：]\s*/, '') || extractPropertyField(html, 'author') || undefined;
    const issueDate = extractPropertyField(html, 'date').match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? fallbackDate;

    return {
        title,
        link: baseUrl,
        ...(description ? { description } : {}),
        ...(issueDate ? { pubDate: timezone(parseDate(issueDate, 'YYYY-MM-DD'), +8) } : {}),
        ...(author ? { author } : {}),
        category,
    };
};

async function handler(ctx) {
    const rootHtml = await fetchPage(rootPageUrl);
    const rootPage = load(rootHtml);
    const pages = parsePageList(rootPage, rootPageUrl);

    if (!pages.length) {
        throw new Error('未找到光明日报电子报最新一期的版面列表，请稍后重试。');
    }

    const issueDate = extractIssueDate(pages[0].link);
    const pageArticles = await pMap(
        pages,
        async (page) => {
            const pageHtml = await cache.tryGet(page.link, () => fetchPage(page.link));
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

                return extractDetail(detailHtml, article.link, article.title, article.issueDate, article.category);
            }),
        { concurrency: 4 }
    );

    return {
        title: `光明日报电子报 - ${issueDate}`,
        link: pages[0].link,
        description: '光明日报电子报最新一期全部版面文章',
        item: items,
    };
}

export const route: Route = {
    path: '/gmrb',
    categories: ['traditional-media'],
    example: '/gmw/gmrb',
    radar: [
        {
            source: ['epaper.gmw.cn/gmrb/html/layout/index.html'],
            target: '/gmrb',
        },
    ],
    name: '光明日报电子报',
    maintainers: ['ZHA30'],
    handler,
    url: 'epaper.gmw.cn',
    description: '抓取光明日报电子报最新一期全部版面文章。',
};
