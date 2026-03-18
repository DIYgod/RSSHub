import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://bjrbdzb.bjd.com.cn';
const requestHeaders = {
    'User-Agent': config.trueUA,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    Referer: `${rootUrl}/`,
    'Upgrade-Insecure-Requests': '1',
};

type Article = {
    title: string;
    link: string;
    issue: string;
    category: string[];
};

type Edition = {
    title: string;
    page: string;
    anchor?: string;
    articles: Article[];
};

type NewspaperConfig = {
    paperId: string;
    paperName: string;
};

const fetchPage = (url: string) =>
    ofetch<string, 'text'>(url, {
        responseType: 'text',
        headers: requestHeaders,
    });

const normalizeText = (value?: string) => value?.replaceAll(/\s+/g, ' ').trim() ?? '';

const formatIssueDate = (issue: string) => `${issue.slice(0, 4)}-${issue.slice(4, 6)}-${issue.slice(6, 8)}`;

const normalizeEditionTitle = (title: string) => {
    const normalizedTitle = normalizeText(title);
    const matched = normalizedTitle.match(/^(第\d+版)\s*(.*)$/);

    if (!matched) {
        return normalizedTitle;
    }

    const [, edition, name] = matched;
    return name ? `${edition}：${name}` : edition;
};

const normalizeIssue = (issue?: string) => {
    if (!issue) {
        return;
    }

    if (!/^\d{8}$/.test(issue)) {
        throw new InvalidParameterError('issue must be in YYYYMMDD format');
    }

    return issue;
};

const normalizePage = (page?: string) => {
    if (!page) {
        return;
    }

    if (!/^\d{1,3}$/.test(page)) {
        throw new InvalidParameterError('page must be a 1 to 3 digit edition number');
    }

    return page.padStart(3, '0');
};

const buildIssueUrl = (paperId: string, issue: string) => `${rootUrl}/${paperId}/mobile/${issue.slice(0, 4)}/${issue}/${issue}_m.html`;

const resolveRelativeUrl = (url: string, baseUrl: string) => {
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('mailto:') || url.startsWith('javascript:') || url.startsWith('#')) {
        return url;
    }

    return new URL(url, baseUrl).href;
};

const extractLatestIssue = (html: string, paperName: string, rootPageUrl: string) => {
    const matched = html.match(/window\.location\.href\s*=\s*["']([^"']*\/(\d{8})\/\2_m\.html)/i);

    if (!matched) {
        throw new Error(`无法从${paperName}电子报首页识别最新刊期，请稍后重试。`);
    }

    return {
        issue: matched[2],
        issueUrl: new URL(matched[1], rootPageUrl).href,
    };
};

const extractPageCode = (value?: string) => value?.match(/_(\d{3})(?:\/|_)/)?.[1];

const extractAnchor = (value?: string) => value?.match(/#page\d+/)?.[0];

const parseIssuePage = (html: string, issueUrl: string, issue: string): Edition[] => {
    const $ = load(html);
    const seenPages = new Set<string>();

    return $('.nav-items')
        .toArray()
        .map((element) => {
            const item = $(element);
            const heading = item.find('.nav-panel-heading').first();
            const pageTitle = normalizeEditionTitle(heading.text());
            const pdfHref = heading.attr('pdf_href');
            const articleLinks = item.find('.nav-list-group a[data-href]').toArray();
            const firstHref = $(articleLinks[0]).attr('data-href');
            const pageCode = extractPageCode(pdfHref) ?? extractPageCode(firstHref);

            if (!pageTitle || !pageCode || seenPages.has(pageCode)) {
                return null;
            }

            seenPages.add(pageCode);

            const seenLinks = new Set<string>();
            const articles = articleLinks
                .map((articleElement) => {
                    const articleItem = $(articleElement);
                    const href = articleItem.attr('data-href');
                    const title = normalizeText(articleItem.text());

                    if (!href || !title) {
                        return null;
                    }

                    const link = new URL(href.split('#')[0], issueUrl).href;

                    if (seenLinks.has(link)) {
                        return null;
                    }

                    seenLinks.add(link);

                    return {
                        title,
                        link,
                        issue,
                        category: [pageTitle],
                    };
                })
                .filter((article): article is Article => article !== null);

            return {
                title: pageTitle,
                page: pageCode,
                anchor: extractAnchor(firstHref),
                articles,
            };
        })
        .filter((edition): edition is Edition => edition !== null && edition.articles.length > 0);
};

const extractAuthor = (authorText: string, paperName: string) => {
    const candidates = normalizeText(authorText)
        .split('|')
        .map((part) => normalizeText(part))
        .filter((part) => part && part !== paperName && !/^\d{4}年\d{2}月\d{2}日$/.test(part));

    return candidates.length ? candidates.join(' | ') : undefined;
};

const extractDetail = (html: string, baseUrl: string, fallbackTitle: string, issue: string, category: string[], paperName: string) => {
    const $ = load(html);
    const mainTitle = normalizeText($('#main-title').first().text()) || fallbackTitle;
    const subTitle = normalizeText($('#sub-title').first().text());
    const title = subTitle ? `${mainTitle} - ${subTitle}` : mainTitle;
    const content = $('#content').first();

    content.find('script, style').remove();

    content.find('img').each((_, element) => {
        const item = $(element);
        const source = item.attr('src') || item.attr('data-src');

        if (source) {
            item.attr('src', resolveRelativeUrl(source, baseUrl));
        }
    });

    content.find('a').each((_, element) => {
        const item = $(element);
        const href = item.attr('href');

        if (href) {
            item.attr('href', resolveRelativeUrl(href, baseUrl));
        }
    });

    const description = content.html()?.trim() || undefined;
    const dateText = normalizeText($('#date').first().text());
    const pubDate = dateText ? timezone(parseDate(dateText, 'YYYY年MM月DD日'), +8) : timezone(parseDate(formatIssueDate(issue), 'YYYY-MM-DD'), +8);
    const author = extractAuthor($('#author').first().text(), paperName);

    return {
        title,
        ...(description ? { description } : {}),
        pubDate,
        ...(author ? { author } : {}),
        category,
    };
};

const getIssueContext = async (paperId: string, paperName: string, rootPageUrl: string, issue?: string) => {
    if (issue) {
        const issueUrl = buildIssueUrl(paperId, issue);

        try {
            const issueHtml = await cache.tryGet(issueUrl, () => fetchPage(issueUrl));

            return {
                issue,
                issueUrl,
                issueHtml,
            };
        } catch {
            throw new Error(`未找到 ${formatIssueDate(issue)} 的${paperName}电子报，请确认刊期是否存在。`);
        }
    }

    const rootHtml = await cache.tryGet(rootPageUrl, () => fetchPage(rootPageUrl));
    const latestIssue = extractLatestIssue(rootHtml, paperName, rootPageUrl);
    const issueHtml = await cache.tryGet(latestIssue.issueUrl, () => fetchPage(latestIssue.issueUrl));

    return {
        issue: latestIssue.issue,
        issueUrl: latestIssue.issueUrl,
        issueHtml,
    };
};

export const createRoute = ({ paperId, paperName }: NewspaperConfig): Route => {
    const routeName = `${paperName}电子报`;
    const rootPageUrl = `${rootUrl}/${paperId}/paperindex.htm`;

    const handler: Route['handler'] = async (ctx) => {
        const issue = normalizeIssue(ctx.req.param('issue'));
        const page = normalizePage(ctx.req.param('page'));
        const { issue: resolvedIssue, issueUrl, issueHtml } = await getIssueContext(paperId, paperName, rootPageUrl, issue);
        const editions = parseIssuePage(issueHtml, issueUrl, resolvedIssue);

        if (!editions.length) {
            throw new Error(`未找到 ${formatIssueDate(resolvedIssue)} 的版面列表，请稍后重试。`);
        }

        const selectedEditions = page ? editions.filter((edition) => edition.page === page) : editions;

        if (!selectedEditions.length) {
            throw new Error(`未找到 ${formatIssueDate(resolvedIssue)} 的第 ${Number.parseInt(page ?? '', 10)} 版，请确认版次是否正确。`);
        }

        const selectedAnchor = selectedEditions[0].anchor;
        const selectedArticles = selectedEditions.flatMap((edition) => edition.articles);
        const seenLinks = new Set<string>();
        const uniqueArticles = selectedArticles.filter((article) => {
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
                        ...extractDetail(detailHtml, article.link, article.title, article.issue, article.category, paperName),
                    };
                }),
            { concurrency: 4 }
        );

        const issueDate = formatIssueDate(resolvedIssue);
        const pageDescription = page ? `${selectedEditions[0].title}文章` : '全部版面文章';

        return {
            title: page ? `${routeName} - ${issueDate} - ${selectedEditions[0].title}` : `${routeName} - ${issueDate}`,
            link: page && selectedAnchor ? `${issueUrl}${selectedAnchor}` : issueUrl,
            description: `${routeName} ${issueDate} ${pageDescription}`,
            item: items,
        };
    };

    return {
        path: `/${paperId}/:issue?/:page?`,
        categories: ['traditional-media'],
        example: `/bjd/${paperId}`,
        parameters: {
            issue: '报纸日期，格式为 `YYYYMMDD`，默认为最新一期',
            page: '版次编号，支持 `1` 至 `3` 位数字，将规范化为三位，例如 `1` 和 `001` 均表示第 1 版',
        },
        features: {
            antiCrawler: true,
        },
        radar: [
            {
                source: [`bjrbdzb.bjd.com.cn/${paperId}/paperindex.htm`],
                target: `/${paperId}`,
            },
        ],
        name: routeName,
        maintainers: ['ZHA30'],
        handler,
        url: `bjrbdzb.bjd.com.cn/${paperId}/paperindex.htm`,
        description: `抓取${routeName}，支持最新一期、指定期和指定版。`,
    };
};
