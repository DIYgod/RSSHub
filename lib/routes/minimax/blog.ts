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
    '@type'?: string;
    name?: string;
    headline?: string;
    datePublished?: string;
    image?: string[];
    author?: JsonLdAuthor;
}

const extractArticleJsonLd = ($: CheerioAPI) => {
    const graphNodes: JsonLdGraphNode[] = JSON.parse($('script[type="application/ld+json"]:contains("NewsArticle")').text())['@graph'];
    const nodeById = new Map(graphNodes.map((node) => [node['@id'], node]));

    const articleNode = graphNodes.find((node) => ARTICLE_LD_TYPES.has(node['@type'] ?? ''));

    if (!articleNode) {
        return {};
    }

    const rawAuthors = articleNode.author ? [articleNode.author] : [];
    const authors = rawAuthors.map((author) => author.name || (author['@id'] ? nodeById.get(author['@id'])?.name : undefined)).filter((name): name is string => Boolean(name));

    return {
        headline: articleNode.headline,
        datePublished: articleNode.datePublished,
        image: articleNode.image?.[0],
        author: authors.length > 0 ? authors.join(', ') : undefined,
    };
};

const extractBlogCategories = ($header: Cheerio<Element>, $: CheerioAPI): string[] =>
    $header
        .find('span[class*="rounded-"]')
        .toArray()
        .map((span) => $(span).text())
        .filter((tag) => Boolean(tag) && !tag.toLowerCase().startsWith('by '));

const extractBlogBody = ($article: Cheerio<Element>, $: CheerioAPI, baseUrl: string): string => {
    const $prose = $article.find('.prose');
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
        const $article = $('article');
        const $header = $article.find('header');

        const title = $header.find('h1').text() || card.title || jsonLd.headline || '';
        const categories = extractBlogCategories($header, $);
        const headerDate = $header.find('time').text();
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

    const cards = $('[class^="BlogList_grid__"] > a')
        .toArray()
        .flatMap((el) => {
            const $card = $(el);
            const link = resolveAbsoluteUrl($card.attr('href'), config.baseUrl);
            if (!link) {
                return [];
            }
            return {
                link,
                title: $card.find('h2, h3').text(),
                listDate: $card.find('time').text(),
                listImage: unwrapNextImageUrl($card.find('img').attr('src'), config.baseUrl),
            };
        });

    const targetCards = cards.slice(0, getRouteLimit(ctx, DEFAULT_LIMIT));
    const items = await pMap(targetCards, (card) => fetchBlogDetail(card, config.baseUrl), {
        concurrency: DETAIL_CONCURRENCY,
    });

    const pageTitle = $('title').text() || `MiniMax Blog (${config.titleSuffix})`;
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
