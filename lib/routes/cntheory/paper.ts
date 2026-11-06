import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const rootUrl = 'https://paper.studytimes.cn/cntheory';
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
    const data = await ofetch<string>(url);
    return { data, url };
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

const isArticleUrl = (url: string) => /content_\d+\.html(?:[?#].*)?$/.test(url);

// Empty placeholders like `<h3 class="subtitle"></h3>` should not end up in titles
const hasText = (text?: string | null): text is string => Boolean(text && /\S/.test(text));

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
    return $('.news-list a[href], MAP area[href], map area[href]')
        .toArray()
        .flatMap((element) => {
            const rawHref = $(element).attr('href');
            const link = resolveLink(rawHref, baseUrl);
            if (!link || !isArticleUrl(link) || seen.has(link)) {
                return [];
            }
            seen.add(link);
            const attrTitle = $(element).attr('title');
            const title = hasText(attrTitle) ? attrTitle : $(element).text();
            return {
                title: hasText(title) ? title : undefined,
                link,
                category: categoryName ? [categoryName] : undefined,
            };
        });
};

const getArticleDetails = async (article: ArticleLink, pubDate?: Date): Promise<DataItem> => {
    const details = await cache.tryGet<ArticleDetails>(`cntheory:paper:${article.link}`, async () => {
        const page = await getPage(article.link);
        const $ = load(page.data);

        const h1Title = $('#news_content h1').text();
        const headline = $('#news_content .headline').text();
        const subtitle = $('#news_content .subtitle').text();

        let title = hasText(h1Title) ? h1Title : article.title;
        if (hasText(headline)) {
            title = title ? `${headline} ${title}` : headline;
        }
        if (hasText(subtitle)) {
            title = title ? (/^\s*——/.test(subtitle) ? `${title}${subtitle}` : `${title} ${subtitle}`) : subtitle;
        }

        const content = $('cms-content#content, cms-content, #content').first();

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

        removeComments(content);
        content.find('script, style').remove();

        const authorCandidate = $('.datesource')
            .toArray()
            .map((element) =>
                $(element)
                    .text()
                    .replace(/\s*字数.*$/, '')
                    .trim()
            )
            .find((text) => text && !text.includes('《 学习时报 》') && !text.includes('《学习时报》'));

        const contentHtml = content.html();

        return {
            title,
            description: hasText(contentHtml) ? contentHtml : undefined,
            author: authorCandidate || undefined,
        };
    });

    return {
        ...details,
        title: details.title ?? article.link,
        link: article.link,
        pubDate,
        category: article.category,
    };
};

const parseEditionDate = (firstNodeUrl: string) => {
    const dateMatch = firstNodeUrl.match(/\/(\d{4})-(\d{2})\/(\d{2})\//);
    const dateString = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : undefined;
    const editionDate = dateString ? timezone(parseDate(dateString, 'YYYY-MM-DD', true), 8) : undefined;
    return { dateString, editionDate };
};

const getEditionLayout = async (indexUrl: string) => {
    const indexRes = await getPage(indexUrl);
    const redirectMatch = indexRes.data.match(/window\.location\.href\s*=\s*['"]\.?\/?([^'"]+)['"]/);
    if (!redirectMatch) {
        throw new Error('Failed to resolve current edition URL for Study Times');
    }
    const layoutUrl = new URL(redirectMatch[1], `${indexUrl.replace(/\/+$/, '')}/`).href;
    const layout = await getPage(layoutUrl);
    const layout$ = load(layout.data);

    const nodeLinks = layout$('.layout-catalogue-list li.layout-catalogue-item')
        .toArray()
        .map((element) => {
            const linkElement = layout$(element).find('a[href]').first();
            const href = linkElement.attr('href');
            const match = href?.match(/node_(\d+)\.html/);
            const name = linkElement.text().replaceAll(/\s+/g, ' ').trim();
            const page = match?.[1] ? match[1].padStart(2, '0') : undefined;
            return {
                page,
                name,
                url: resolveLink(href, layout.url),
            };
        })
        .filter((n): n is NodeLink => Boolean(n.page && n.url));

    if (nodeLinks.length === 0) {
        throw new Error('No edition layout found for Study Times');
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
        { concurrency }
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

const matchNode = (node: NodeLink, id: string) => {
    const trimmed = id.trim();
    if (/^\d{1,2}$/.test(trimmed)) {
        const pageNum = trimmed.padStart(2, '0');
        return node.page === pageNum || node.page.replace(/^0+/, '') === trimmed;
    }
    return node.name === trimmed || node.name.split(/[:：]/).pop()?.trim() === trimmed || node.name.includes(trimmed);
};

export const route: Route = {
    path: '/paper/:id?',
    categories: ['traditional-media'],
    example: '/cntheory/paper',
    parameters: { id: '版块或版面编号，默认为全部，如 `国内大局` 或 `01`；使用 `all` 或留空获取全部版面' },
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
            source: ['paper.studytimes.cn', 'paper.studytimes.cn/cntheory'],
            target: '/paper',
        },
        {
            source: ['paper.studytimes.cn/cntheory/:yearMonth/:day/node_:id.html'],
            target: '/paper/:id',
        },
    ],
    name: '学习时报',
    maintainers: ['nczitzk', 'zhangsan-xyz'],
    url: 'paper.studytimes.cn/cntheory',
    description: '获取当日《学习时报》数字报的全部文章或指定版面文章。如订阅 **01 版：国内大局**，路由为 `/cntheory/paper/国内大局` 或 `/cntheory/paper/01`。',
    handler,
};

async function handler(ctx) {
    const requestedId = ctx.req.param('id');
    const limit = getRouteLimit(ctx, 100);

    const { nodeLinks, layoutUrl } = await getEditionLayout(rootUrl);
    const { editionDate, dateString } = parseEditionDate(nodeLinks[0].url);

    const selectedNode = !requestedId || requestedId === 'all' ? undefined : nodeLinks.find((node) => matchNode(node, requestedId));

    if (requestedId && requestedId !== 'all' && !selectedNode) {
        throw new InvalidParameterError(`Study Times section or page '${requestedId}' not found in current edition`);
    }

    const targetNodes = selectedNode ? [selectedNode] : nodeLinks;
    const targetArticles = await fetchTargetArticles(targetNodes, limit);

    if (targetArticles.length === 0) {
        throw new Error(`No articles found for Study Times ${requestedId ?? 'paper'}`);
    }

    const items = await pMap(targetArticles, (article) => getArticleDetails(article, editionDate), { concurrency });

    const feedTitle = `学习时报${selectedNode ? ` - ${selectedNode.name}` : ''}${dateString ? ` - ${dateString}` : ''}`;

    return {
        title: feedTitle,
        link: selectedNode?.url ?? layoutUrl,
        item: items,
    };
}
