import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import { renderFallbackDescription } from './templates/description';
import {
    DEFAULT_LIMIT,
    DETAIL_CONCURRENCY,
    extractRscVideoUrls,
    fetchHtml,
    hasRenderableContent,
    LANG_PARAM_EN,
    LANG_PARAM_ZH,
    normalizeRichContent,
    resolveAbsoluteUrl,
    resolveLocaleConfig,
    toValidDate,
    unwrapNextImageUrl,
} from './utils';

const CONTENT_TYPE_EXTERNAL = 1;

interface NewsApiItem {
    newsId: string;
    title: string;
    content?: string;
    contentType?: number;
    externalLink?: string;
    summary?: string;
    tags?: string[];
    coverImageUrl?: string;
    publishDate?: number | string;
    slug: string;
    source?: string;
}

interface NewsApiResponse {
    data?: NewsApiItem[];
}

const resolveNewsLink = (item: NewsApiItem, baseUrl: string): string => {
    if (item.contentType === CONTENT_TYPE_EXTERNAL && item.externalLink) {
        const external = resolveAbsoluteUrl(item.externalLink, baseUrl);
        if (external) {
            return external;
        }
    }
    return `${baseUrl}/news/${encodeURIComponent(item.slug)}`;
};

const fetchNewsDetail = (item: NewsApiItem, link: string, baseUrl: string): Promise<DataItem> => {
    const pubDate = toValidDate(item.publishDate);
    const image = unwrapNextImageUrl(item.coverImageUrl, baseUrl);
    const category = item.tags?.filter((tag) => Boolean(tag?.trim()));
    const isExternal = item.contentType === CONTENT_TYPE_EXTERNAL && Boolean(resolveAbsoluteUrl(item.externalLink, baseUrl));

    if (isExternal) {
        return Promise.resolve({
            title: item.title,
            link,
            description: renderFallbackDescription(item.summary, image),
            pubDate,
            author: 'MiniMax',
            category: category?.length ? category : undefined,
            image,
        });
    }

    return cache.tryGet<DataItem>(`minimax:news:${link}`, async () => {
        const html = await fetchHtml(link);
        const $ = load(html);
        const $prose = $('article .prose').first();
        const $target = $prose.length > 0 ? $prose : $('main');

        let description = '';
        if ($target.length > 0) {
            const videoUrls = $prose.length > 0 ? [] : extractRscVideoUrls($, baseUrl);
            // Strip the page-level header block containing title/date in both payload and go layouts
            $target
                .children()
                .filter((_, el) => $(el).is('header, h1') || $(el).find('h1').length > 0)
                .remove();
            description = normalizeRichContent($target, $, baseUrl, videoUrls);
        }

        const result: DataItem = {
            title: item.title,
            link,
            description: hasRenderableContent(description) ? description : renderFallbackDescription(item.summary, image),
            pubDate,
            author: 'MiniMax',
            category: category?.length ? category : undefined,
            image,
        };

        return result;
    });
};

async function handler(ctx: Context): Promise<Data> {
    const config = resolveLocaleConfig(ctx.req.param('lang'));
    const newsUrl = `${config.baseUrl}/news`;
    const apiResponse = await ofetch<NewsApiResponse>(`${config.baseUrl}/api/news`, {
        query: {
            page: 1,
            locale: config.apiLocale,
        },
    });

    const targetItems = (apiResponse.data ?? []).slice(0, getRouteLimit(ctx, DEFAULT_LIMIT));
    const items = await pMap(targetItems, (item) => fetchNewsDetail(item, resolveNewsLink(item, config.baseUrl), config.baseUrl), {
        concurrency: DETAIL_CONCURRENCY,
    });

    return {
        title: `MiniMax News (${config.titleSuffix})`,
        description: config.apiLocale === 'zh' ? 'MiniMax 官方新闻、公司公告与生态合作动态' : 'Official news, announcements, and partnership updates from MiniMax',
        link: newsUrl,
        language: config.feedLanguage,
        item: items,
    };
}

export const route: Route = {
    path: '/news/:lang?',
    name: 'News',
    url: 'minimax.io/news',
    example: '/minimax/news',
    categories: ['programming'],
    view: ViewType.Articles,
    maintainers: ['ljh12138164'],
    parameters: {
        lang: LANG_PARAM_EN,
    },
    description: 'Full-text official news and announcements from MiniMax (`minimax.io/news` by default, or `minimax.cn/news` with `zh-CN`), supporting both modern and legacy article layouts and the common `limit` parameter.',
    zh: {
        name: '新闻',
        parameters: {
            lang: LANG_PARAM_ZH,
        },
        description: '获取 MiniMax 官方新闻、公告与生态动态全文（默认英文站 `minimax.io/news`，传入 `zh-CN` 可切换至中文站 `minimax.cn/news`），支持通用 `limit` 参数。',
    },
    radar: [
        {
            source: ['minimax.io/news', 'www.minimax.io/news', 'minimax.io/news/:slug', 'www.minimax.io/news/:slug'],
            target: '/news',
        },
        {
            source: ['minimax.cn/news', 'www.minimax.cn/news', 'minimax.cn/news/:slug', 'www.minimax.cn/news/:slug'],
            target: '/news/zh-CN',
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
