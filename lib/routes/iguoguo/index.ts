import { load } from 'cheerio';
import type { Context } from 'hono';

import { config } from '@/config';
import type { Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const rootUrl = 'https://www.iguoguo.net';

const imageMimeTypes: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif', svg: 'image/svg+xml' };

const getCategoryIdFromSlug = (slug) =>
    cache.tryGet(`iguoguo:category:${slug}`, async () => {
        const response = await ofetch(`${rootUrl}/wp-json/wp/v2/categories`, {
            query: {
                slug,
            },
        });
        if (!Array.isArray(response) || !response[0]?.id) {
            throw new Error('The source did not return the H5 category. Check whether the original WordPress API is still available.');
        }
        return response[0].id;
    });

const getPostsByCategory = (categoryId, limit) =>
    cache.tryGet(
        `iguoguo:posts:${categoryId}:${limit}`,
        async () => {
            const response = await ofetch(`${rootUrl}/wp-json/wp/v2/posts`, {
                query: {
                    categories: categoryId,
                    per_page: limit,
                },
            });
            return response;
        },
        config.cache.routeExpire,
        false
    );

export const route: Route = {
    path: '/html5',
    categories: ['design'],
    example: '/iguoguo/html5',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '最新 H5',
    maintainers: ['yuxinliu-alex'],
    handler,
};

function getGmtDate(value: string | undefined) {
    const date = value ? parseDate(`${value.replace(/Z$/, '')}Z`) : undefined;
    return date && !Number.isNaN(date.getTime()) ? date : undefined;
}

async function handler(ctx: Context) {
    const limit = Math.min(getRouteLimit(ctx, 10), 100);
    const currentUrl = `${rootUrl}/html5`;
    const categorySlug = 'h5';

    const categoryId = await getCategoryIdFromSlug(categorySlug);
    const posts = await getPostsByCategory(categoryId, limit);

    const items = posts.map((item) => {
        const $ = load(item.content.rendered);
        const cover = $('p > img').first().attr('src');
        const mediaContent: Record<string, string> | undefined = cover ? { url: new URL(cover, rootUrl).href } : undefined;
        const extension = cover ? new URL(cover, rootUrl).pathname.split('.').pop()?.toLowerCase() : undefined;
        const imageMimeType = mediaContent && extension ? imageMimeTypes[extension] : undefined;
        if (imageMimeType && mediaContent) {
            mediaContent.type = imageMimeType;
        }

        $('h4').each((_, el) => {
            if ($(el).text().includes('扫码欣赏')) {
                $(el).remove();
            }
        });
        return {
            title: item.title.rendered,
            description: $.html(),
            link: item.link,
            pubDate: getGmtDate(item.date_gmt),
            media: mediaContent ? { content: mediaContent } : undefined,
        };
    });
    return {
        title: '爱果果',
        link: currentUrl,
        description: '爱果果iguoguo是一个优秀酷站、h5、UI素材资源的发布分享平台，是设计师的灵感聚合地和素材下载源。',
        language: 'zh-CN' as const satisfies Language,
        item: items,
    };
}
