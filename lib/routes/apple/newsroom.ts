import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Item } from 'rss-parser';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const baseUrl = 'https://www.apple.com.cn';
const rootUrl = `${baseUrl}/newsroom/`;
const feedUrl = `${rootUrl}rss-feed.rss`;
const defaultLimit = 20;
const articleCleanupSelector = '.scrollfade, .article-header, .featured-header, .paddlenav, .articleshare, .nr-article-share, .docsanddownloads, .presscontacts, .sharesheet, .nr-accordion, .sosumi';
const articleElementCleanupSelector = 'style, picture source, button, aside, [download]';

const extractArticleDescription = ($: CheerioAPI) => {
    const article = $('.article');

    if (!article.length) {
        return;
    }

    $(articleCleanupSelector, article).remove();
    $(articleElementCleanupSelector, article).remove();
    article.find('[style]').removeAttr('style');
    article.find('sup').remove();

    return article.html() ?? undefined;
};

const fetchArticle = (item: Item & { link: string }) =>
    cache.tryGet(item.link, async () => {
        const response = await ofetch(item.link);
        const $ = load(response);
        const category = $('.category-eyebrow__category').first().text();
        const fallbackDate = $('.category-eyebrow__date').first().text();
        const description = extractArticleDescription($);
        const ogTitle = $('meta[property="og:title"]').attr('content');
        const ogImage = $('meta[property="og:image"]').attr('content');
        const pubDate = item.isoDate ?? item.pubDate;

        return {
            title: ogTitle ?? item.title ?? item.link,
            link: item.link,
            description: description ?? item.content ?? item.contentSnippet,
            pubDate: pubDate ? parseDate(pubDate) : fallbackDate ? parseDate(fallbackDate, 'YYYY 年 M 月 D 日') : undefined,
            author: item.author ?? 'Apple Newsroom',
            category: category ? [category] : item.categories,
            image: ogImage ?? item.enclosure?.url,
        };
    });

async function handler(ctx) {
    const limit = Math.max(Number.parseInt(ctx.req.query('limit') ?? '', 10) || defaultLimit, 1);
    const feedResponse = await ofetch(feedUrl, {
        parseResponse: (text) => text,
    });
    const feed = await parser.parseString(feedResponse);
    const items = await Promise.all(
        (feed.items as Item[])
            .slice(0, limit)
            .filter((item): item is Item & { link: string } => Boolean(item.link))
            .map((item) => fetchArticle(item))
    );

    return {
        title: 'Apple Newsroom (中国大陆)',
        link: rootUrl,
        feedLink: feedUrl,
        description: 'Apple 新闻中心是 Apple 新闻的来源。阅读新闻稿、获取最新消息、观看视频和下载图片。',
        item: items,
        language: 'zh-CN',
    };
}

export const route: Route = {
    path: '/newsroom',
    name: 'Newsroom (中国大陆)',
    url: 'www.apple.com.cn/newsroom',
    maintainers: ['LinxHex'],
    example: '/apple/newsroom',
    description: 'The official source for news about Apple, from Apple. Read press releases, get updates, watch video and download images.',
    categories: ['new-media'],
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
            source: ['www.apple.com.cn/newsroom', 'www.apple.com.cn/newsroom/:year/:month/:slug'],
            target: '/newsroom',
        },
    ],
    view: ViewType.Articles,
    zh: {
        path: '/newsroom',
        name: '新闻中心（中国大陆）',
        url: 'www.apple.com.cn/newsroom',
        maintainers: ['LinxHex'],
        example: '/apple/newsroom',
        description: 'Apple 新闻中心是 Apple 新闻的来源。阅读新闻稿、获取最新消息、观看视频和下载图片。',
        handler,
    },
    handler,
};
