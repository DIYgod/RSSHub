import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import { getRouteLimit } from '@/utils/route-limit';

import { renderFallbackDescription } from './templates/description';
import { DEFAULT_LIMIT, DETAIL_CONCURRENCY, fetchHtml, hasRenderableContent, LANG_PARAM_EN, LANG_PARAM_ZH, normalizeRichContent, resolveAbsoluteUrl, resolveLocaleConfig, toValidDate, unwrapNextImageUrl } from './utils';

const ARTICLE_LD_TYPES = new Set(['NewsArticle', 'BlogPosting', 'Article']);

interface BlogCardMeta {
    link: string;
    title: string;
    listDate: string;
    listImage?: string;
}

interface JsonLdAuthor {
    '@id'?: string;
    name?: string;
}

interface JsonLdGraphNode {
    '@id'?: string;
    '@type'?: string | string[];
    name?: string;
    headline?: string;
    datePublished?: string;
    image?: string[] | string;
    author?: JsonLdAuthor[] | JsonLdAuthor;
}

const extractArticleJsonLd = ($: CheerioAPI) => {
    const graphNodes: JsonLdGraphNode[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const parsed = JSON.parse($(el).text());
            if (Array.isArray(parsed?.['@graph'])) {
                graphNodes.push(...parsed['@graph']);
            } else if (parsed && typeof parsed === 'object') {
                graphNodes.push(parsed);
            }
        } catch {
            // Ignore malformed JSON-LD script
        }
    });

    const nodeById = new Map<string, JsonLdGraphNode>();
    for (const node of graphNodes) {
        if (node['@id']) {
            nodeById.set(node['@id'], node);
        }
    }

    const articleNode = graphNodes.find((node) => {
        const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
        return types.some((t) => ARTICLE_LD_TYPES.has(t ?? ''));
    });

    if (!articleNode) {
        return {};
    }

    const rawAuthors = Array.isArray(articleNode.author) ? articleNode.author : articleNode.author ? [articleNode.author] : [];
    const authors = rawAuthors.map((author) => author.name || (author['@id'] ? nodeById.get(author['@id'])?.name : undefined)).filter((name): name is string => Boolean(name));

    const imageList = Array.isArray(articleNode.image) ? articleNode.image : articleNode.image ? [articleNode.image] : [];

    return {
        headline: articleNode.headline,
        datePublished: articleNode.datePublished,
        image: imageList[0],
        author: authors.length > 0 ? authors.join(', ') : undefined,
    };
};

const extractBlogCategories = ($header: Cheerio<Element>, $: CheerioAPI): string[] => [
    ...new Set(
        $header
            .find('span[class*="rounded-"]')
            .toArray()
            .map((span) => $(span).text().trim())
            .filter((tag) => Boolean(tag) && !tag.toLowerCase().startsWith('by '))
    ),
];

const extractBlogBody = ($article: Cheerio<Element>, $: CheerioAPI, baseUrl: string): string => {
    const $prose = $article.find('.prose').first();
    if ($prose.length > 0) {
        return normalizeRichContent($prose, $, baseUrl);
    }
    if ($article.length > 0) {
        $article.find('header').remove();
        return normalizeRichContent($article, $, baseUrl);
    }
    return '';
};

const fetchBlogDetail = (card: BlogCardMeta, baseUrl: string) =>
    cache.tryGet(`minimax:blog:${card.link}`, async () => {
        const html = await fetchHtml(card.link);
        const $ = load(html);
        const jsonLd = extractArticleJsonLd($);
        const $article = $('article').first();
        const $header = $article.find('header').first();

        const title = $header.find('h1').first().text() || card.title || jsonLd.headline || '';
        const categories = extractBlogCategories($header, $);
        const headerDate = $header.find('time').first().text().trim();
        const pubDate = toValidDate(jsonLd.datePublished) ?? toValidDate(headerDate || card.listDate);
        const ogImage = unwrapNextImageUrl($('meta[property="og:image"]').attr('content'), baseUrl);
        const image = ogImage ?? unwrapNextImageUrl(jsonLd.image, baseUrl) ?? card.listImage;

        const bodyHtml = extractBlogBody($article, $, baseUrl);
        const summary = $('meta[name="description"]').attr('content')?.trim();
        const description = hasRenderableContent(bodyHtml) ? bodyHtml : renderFallbackDescription(summary);

        const item: DataItem = {
            title,
            link: card.link,
            description,
            pubDate,
            author: jsonLd.author,
            category: categories.length > 0 ? categories : undefined,
            image,
        };

        return item;
    });

async function handler(ctx: Context): Promise<Data> {
    const config = resolveLocaleConfig(ctx.req.param('lang'));
    const blogUrl = `${config.baseUrl}/blog`;
    const listHtml = await fetchHtml(blogUrl);
    const $ = load(listHtml);

    const seenLinks = new Set<string>();
    const cards: BlogCardMeta[] = [];

    $('a[href^="/blog/"]')
        .filter((_, el) => $(el).find('article').length > 0)
        .each((_, el) => {
            const $card = $(el);
            const link = resolveAbsoluteUrl($card.attr('href'), config.baseUrl);
            if (!link || seenLinks.has(link)) {
                return;
            }
            seenLinks.add(link);
            cards.push({
                link,
                title: $card.find('h2, h3').first().text(),
                listDate: $card.find('time').first().text().trim(),
                listImage: unwrapNextImageUrl($card.find('img').first().attr('src'), config.baseUrl),
            });
        });

    const targetCards = cards.slice(0, getRouteLimit(ctx, DEFAULT_LIMIT));
    const items = await pMap(targetCards, (card) => fetchBlogDetail(card, config.baseUrl), {
        concurrency: DETAIL_CONCURRENCY,
    });

    const pageTitle = $('title').first().text() || `MiniMax Blog (${config.titleSuffix})`;
    const pageDescription = $('meta[name="description"]').attr('content');

    return {
        title: pageTitle,
        description: pageDescription,
        link: blogUrl,
        language: config.feedLanguage,
        item: items,
    };
}

export const route: Route = {
    path: '/blog/:lang?',
    name: 'Blog',
    url: 'minimax.io/blog',
    example: '/minimax/blog',
    categories: ['programming'],
    view: ViewType.Articles,
    maintainers: ['ljh12138164'],
    parameters: {
        lang: LANG_PARAM_EN,
    },
    description: 'Full-text official blog and research articles from MiniMax (`minimax.io/blog` by default, or `minimax.cn/blog` with `zh-CN`). Supports the common `limit` parameter.',
    zh: {
        name: '博客',
        parameters: {
            lang: LANG_PARAM_ZH,
        },
        description: '获取 MiniMax 官方博客与技术研究文章全文（默认英文站 `minimax.io/blog`，传入 `zh-CN` 可切换至中文站 `minimax.cn/blog`），支持通用 `limit` 参数。',
    },
    radar: [
        {
            source: ['minimax.io/blog', 'www.minimax.io/blog', 'minimax.io/blog/:slug', 'www.minimax.io/blog/:slug'],
            target: '/blog',
        },
        {
            source: ['minimax.cn/blog', 'www.minimax.cn/blog', 'minimax.cn/blog/:slug', 'www.minimax.cn/blog/:slug'],
            target: '/blog/zh-CN',
        },
    ],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    handler,
};
