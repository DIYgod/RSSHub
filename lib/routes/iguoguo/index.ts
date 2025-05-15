import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
import type { Context } from 'hono';
const rootUrl = 'https://www.iguoguo.net';

const getCategoryIdFromSlug = (slug) =>
    cache.tryGet(`iguoguo:category:${slug}`, async () => {
        const response = await ofetch(`${rootUrl}/wp-json/wp/v2/categories`, {
            query: {
                slug,
            },
        });
        return response[0].id;
    });

const getPostsByCategory = (categoryId, limit) =>
    cache.tryGet(
        `iguoguo:posts:${categoryId}`,
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

async function handler(ctx: Context) {
    const limit = Number.parseInt(ctx.req.query('limit') ?? '10');
    const currentUrl = `${rootUrl}/html5`;
    const categorySlug = 'h5';

    const categoryId = await getCategoryIdFromSlug(categorySlug);
    const posts = await getPostsByCategory(categoryId, limit);

    const mime = {
        jpg: 'jpeg',
        png: 'png',
    };

    const items = posts.map((item) => {
        const $ = load(item.content.rendered);
        const cover = $('p > img').first().attr('src');
        $('p > img').first().remove();
        $('h4').each((_, el) => {
            if ($(el).text().includes('扫码欣赏')) {
                $(el).remove();
            }
        });
        return {
            title: item.title.rendered,
            description: $.html(),
            link: item.link,
            cover,
            pubDate: parseDate(item.date_gmt),
            media: cover && {
                content: {
                    url: cover,
                    type: `image/${mime[cover.split('.').pop()]}`,
                },
            },
        };
    });
    return {
        title: '爱果果',
        link: currentUrl,
        description: '爱果果iguoguo是一个优秀酷站、h5、UI素材资源的发布分享平台，是设计师的灵感聚合地和素材下载源。',
        language: 'zh-cn',
        item: items,
    };
}
