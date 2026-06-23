import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import pMap from 'p-map';
import type { Item } from 'rss-parser';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const rootUrl = 'https://www.zaihua.news';
const feedUrl = `${rootUrl}/rss.xml`;
const author = '在花';

type NewsArticleJsonLd = Record<string, unknown> & {
    headline?: string;
    datePublished?: string;
    dateModified?: string;
};

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/zaihua',
    parameters: {},
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
            source: ['www.zaihua.news/', 'www.zaihua.news/rss.xml'],
            target: '',
        },
    ],
    name: '最新',
    maintainers: ['Circloud'],
    handler,
    url: 'www.zaihua.news',
    description: '在花新闻的全文内容，包含文章图片。',
    view: ViewType.Articles,
};

async function handler() {
    const feedResponse = await ofetch(feedUrl, {
        parseResponse: (text) => text,
    });
    const feed = await parser.parseString(feedResponse);
    const list = feed.items.filter((item): item is Item & { link: string } => Boolean(item.link));
    const items = await pMap(list, (item) => fetchArticle(item), { concurrency: 3 });

    return {
        title: feed.title ?? author,
        link: rootUrl,
        feedLink: feedUrl,
        description: feed.description,
        item: items,
        language: 'zh-CN',
    };
}

const fetchArticle = (item: Item & { link: string }) =>
    cache.tryGet(item.link, async (): Promise<DataItem> => {
        const response = await ofetch(item.link);
        const $ = load(response);
        const jsonLd = extractNewsArticleJsonLd($);
        const content = $('.msg-prose').first();

        cleanupContent($, content);

        const imageUrls = extractImageUrls($);
        const contentHtml = content.html() ?? item.content ?? item.contentSnippet;
        const imageHtml = renderImages(imageUrls);
        const pubDate = $('meta[property="article:published_time"]').attr('content') ?? jsonLd?.datePublished ?? item.isoDate ?? item.pubDate;
        const updated = $('meta[property="article:modified_time"]').attr('content') ?? jsonLd?.dateModified;
        const title = jsonLd?.headline || $('article h1').first().text() || item.title || item.link;

        return {
            title,
            link: item.link,
            description: [contentHtml, imageHtml].filter(Boolean).join(''),
            pubDate: pubDate ? parseDate(pubDate) : undefined,
            updated: updated ? parseDate(updated) : undefined,
            author,
        };
    });

const cleanupContent = ($: CheerioAPI, content: Cheerio<Element>) => {
    content.find('script, style').remove();
    content.find('[class]').removeAttr('class');
    content.find('[style]').removeAttr('style');
    content.find('[data-astro-cid]').removeAttr('data-astro-cid');

    content.children('p').each((_, element) => {
        const paragraph = $(element);
        const links = new Set(
            paragraph
                .find('a')
                .toArray()
                .map((link) => $(link).attr('href'))
        );

        if (links.has('http://t.me/ZaiHuaPd') && links.has('https://t.me/zaihua_news') && links.has('http://t.me/ZaiHuabot')) {
            paragraph.remove();
        }
    });

    content.find('a').each((_, element) => {
        const link = $(element);
        const href = link.attr('href');

        if (href?.startsWith('/')) {
            link.attr('href', new URL(href, rootUrl).href);
        }
    });
};

const extractImageUrls = ($: CheerioAPI) => {
    const galleryImages = $('[data-lightbox-src]')
        .toArray()
        .map((element) => $(element).attr('data-lightbox-src') ?? $(element).find('img').attr('src'))
        .flatMap((src) => (src ? [src] : []));

    return [...new Set(galleryImages)];
};

const renderImages = (imageUrls: string[]) => imageUrls.map((src) => `<p><img src="${escapeAttribute(src)}"></p>`).join('');

const extractNewsArticleJsonLd = ($: CheerioAPI) =>
    $('script[type="application/ld+json"]')
        .toArray()
        .flatMap((element) => {
            try {
                return collectJsonLdObjects(JSON.parse($(element).text()));
            } catch {
                return [];
            }
        })
        .find((item) => isNewsArticle(item));

const collectJsonLdObjects = (value: unknown): NewsArticleJsonLd[] => {
    if (Array.isArray(value)) {
        return value.flatMap((item) => collectJsonLdObjects(item));
    }

    if (!isRecord(value)) {
        return [];
    }

    const graph = Array.isArray(value['@graph']) ? value['@graph'].flatMap((item) => collectJsonLdObjects(item)) : [];

    return [value, ...graph] as NewsArticleJsonLd[];
};

const isNewsArticle = (value: NewsArticleJsonLd) => {
    const type = value['@type'];

    return type === 'NewsArticle' || (Array.isArray(type) && type.includes('NewsArticle'));
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const escapeAttribute = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
