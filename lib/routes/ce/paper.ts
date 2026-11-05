import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const rootUrl = 'http://paper.ce.cn/pc/layout';
const layoutIndexUrl = `${rootUrl}/index.html`;
const concurrency = 3;

type NodeLink = {
    page: string;
    name: string;
    url: string;
};

type ArticleLink = {
    title?: string;
    link: string;
    category?: string[];
};

type ArticleDetails = {
    title?: string;
    description?: string;
    author?: string;
};

const getPage = async (url: string) => {
    const response = await ofetch.raw(url, { responseType: 'text' });
    return { data: (response._data as string) ?? '', url: response.url || url };
};

const resolveLink = (href: string | undefined, base: string) => {
    if (!href) {
        return;
    }
    try {
        const url = new URL(href, base);
        return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
    } catch {
        return;
    }
};

const isArticleUrl = (url: string) => /\/content\/(?:\d{4}-?\d{2}(?:\/\d{2})?|\d{6,8})\/content_\d+\.html(?:[?#].*)?$/.test(url);

const removeComments = ($element: Cheerio<any>) => {
    $element
        .contents()
        .filter((_, node) => node.type === 'comment')
        .remove();
    $element
        .find('*')
        .contents()
        .filter((_, node) => node.type === 'comment')
        .remove();
};

const getArticleLinks = ($: CheerioAPI, baseUrl: string, categoryName?: string): ArticleLink[] => {
    const seen = new Set<string>();
    return $('a[href]')
        .toArray()
        .flatMap((element) => {
            const link = resolveLink($(element).attr('href'), baseUrl);
            if (!link || !isArticleUrl(link) || seen.has(link)) {
                return [];
            }
            seen.add(link);
            const title = $(element).text().replaceAll(/\s+/g, ' ').trim();
            if (title && /责编|责任编辑/.test(title)) {
                return [];
            }
            return {
                title: title || undefined,
                link,
                category: categoryName ? [categoryName] : undefined,
            };
        });
};

const getArticleDetails = async (article: ArticleLink, pubDate?: Date): Promise<DataItem> => {
    try {
        const details = await cache.tryGet<ArticleDetails>(`ce:paper:${article.link}`, async () => {
            const page = await getPage(article.link);
            const $ = load(page.data);
            const title = $('#Title, .m-article-content h1, .article-title, h1').first().text().replaceAll(/\s+/g, ' ').trim() || $('title').text().trim();
            const content = $('#ozoom, #articleContent, .articleContent, .m-article-main, .m-article-text, article')
                .filter((_, element) => $(element).text().trim().length > 0 || $(element).find('img').length > 0)
                .first();

            const attachment = $('.attachment');
            if (attachment.find('img').length > 0 || attachment.text().trim().length > 0) {
                content.prepend(attachment);
            }

            // Resolve relative links and images in content
            content.find('img').each((_, element) => {
                const src = $(element).attr('src');
                if (!src) {
                    return;
                }
                const resolved = resolveLink(src, article.link);
                if (!resolved) {
                    return;
                }
                $(element).attr('src', resolved);
            });
            content.find('a').each((_, element) => {
                const href = $(element).attr('href');
                if (!href) {
                    return;
                }
                const resolved = resolveLink(href, article.link);
                if (!resolved) {
                    return;
                }
                $(element).attr('href', resolved);
            });

            // Strip all comment nodes (including Founder enpproperty metadata comments)
            removeComments(content);

            const authorText = $('#Author, .author, .mob-author, .m-article-author, .appellation')
                .first()
                .text()
                .replace(/^作者[:：]\s*/, '')
                .replaceAll(/\s+/g, ' ')
                .trim();
            const enpAuthor = page.data.match(/<author>([^<]*)<\/author>/)?.[1]?.trim();
            const rawAuthor = enpAuthor || authorText || undefined;
            const author = rawAuthor?.replace(/^[□■◆▲·•\s]+/, '').trim() || undefined;

            return {
                title: title || undefined,
                description: content.html()?.trim(),
                author,
            };
        });

        return {
            ...details,
            title: details.title || article.title || article.link,
            link: article.link,
            pubDate,
            category: article.category,
        };
    } catch {
        return {
            title: article.title || article.link,
            link: article.link,
            pubDate,
            category: article.category,
        };
    }
};

const parseEditionDate = (firstNodeUrl: string) => {
    const dateMatch = firstNodeUrl.match(/\/(\d{4})[-/]?(\d{2})[-/]?(\d{2})\//);
    const dateString = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : undefined;
    const editionDate = dateString ? timezone(parseDate(dateString, 'YYYY-MM-DD', true), 8) : undefined;
    return { dateString, editionDate };
};

const getEditionLayout = async (layoutUrl: string) => {
    const layout = await getPage(layoutUrl);
    const layout$ = load(layout.data);

    const nodeLinks = layout$('#list li a[href]')
        .toArray()
        .map((element) => {
            const href = layout$(element).attr('href');
            const match = href?.match(/node_(\d+)\.html/);
            const name = layout$(element).text().replaceAll(/\s+/g, ' ').trim();
            return {
                page: match?.[1],
                name,
                url: resolveLink(href, layout.url),
            };
        })
        .filter((n): n is NodeLink => Boolean(n.page && n.url));

    if (nodeLinks.length === 0) {
        throw new Error('No edition layout found for Economic Daily');
    }

    return { nodeLinks, layoutUrl: layout.url };
};

const fetchTargetArticles = async (targetNodes: NodeLink[], limit: number): Promise<ArticleLink[]> => {
    const nodeResults = await pMap(
        targetNodes,
        async (node) => {
            const nodeRes = await getPage(node.url);
            const node$ = load(nodeRes.data);
            return getArticleLinks(node$, nodeRes.url, node.name);
        },
        { concurrency, stopOnError: false }
    );

    const targetArticles: ArticleLink[] = [];
    const seenLinks = new Set<string>();
    for (const links of nodeResults) {
        for (const link of links) {
            if (seenLinks.has(link.link)) {
                continue;
            }
            seenLinks.add(link.link);
            targetArticles.push(link);
            if (targetArticles.length >= limit) {
                return targetArticles;
            }
        }
    }
    return targetArticles;
};

export const route: Route = {
    path: '/paper/:page?',
    categories: ['traditional-media'],
    example: '/ce/paper',
    parameters: { page: '版面编号，如 `01`；使用 `all` 或留空获取全部版面' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['paper.ce.cn', 'paper.ce.cn/index.html', 'paper.ce.cn/pc/layout', 'paper.ce.cn/pc/layout/index.html', 'paper.ce.cn/pad/layout', 'paper.ce.cn/pad/layout/index.html'],
            target: '/paper',
        },
        {
            source: ['paper.ce.cn/pc/layout/:yearMonth/:day/node_:page.html', 'paper.ce.cn/pad/layout/:yearMonth/:day/node_:page.html'],
            target: '/paper/:page',
        },
    ],
    name: '电子版',
    maintainers: ['zhangsan-xyz'],
    url: 'paper.ce.cn/pc/layout/index.html',
    description: '获取当日《经济日报》电子版的全部文章或指定版面文章。',
    handler,
};

async function handler(ctx) {
    const requestedPage = ctx.req.param('page') ?? 'all';
    const limit = getRouteLimit(ctx, 100);

    const { nodeLinks, layoutUrl } = await getEditionLayout(layoutIndexUrl);
    const { editionDate, dateString } = parseEditionDate(nodeLinks[0].url);

    const normalizedPage = /^\d{1,2}$/.test(requestedPage) ? requestedPage.padStart(2, '0') : requestedPage;
    const selectedNode = normalizedPage === 'all' ? undefined : nodeLinks.find((node) => node.page === normalizedPage);

    if (normalizedPage !== 'all' && !selectedNode) {
        throw new InvalidParameterError(`Economic Daily page ${requestedPage} not found in today's edition`);
    }

    const targetNodes = selectedNode ? [selectedNode] : nodeLinks;
    const targetArticles = await fetchTargetArticles(targetNodes, limit);

    if (targetArticles.length === 0) {
        throw new Error(`No articles found for Economic Daily page ${requestedPage}`);
    }

    const items = await pMap(targetArticles, (article) => getArticleDetails(article, editionDate), { concurrency, stopOnError: false });

    const feedTitle = `经济日报电子版${selectedNode ? ` - ${selectedNode.name}` : ''}${dateString ? ` - ${dateString}` : ''}`;

    return {
        title: feedTitle,
        link: selectedNode?.url ?? layoutUrl,
        item: items,
    };
}
