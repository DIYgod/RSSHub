import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/secretsanfrancisco/top-news',
    parameters: { category: 'category name, can be found in url' },
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
            source: ['secretsanfrancisco.com/:category'],
            target: '/:category',
        },
    ],
    name: 'Category',
    maintainers: ['EthanWng97'],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'https://secretsanfrancisco.com';
    const categoryApiPath = '/wp-json/wp/v2/categories';
    const postApiPath = '/wp-json/wp/v2/posts';

    // get category number
    const categorySlug = ctx.req.param('category') || '';

    let category;
    if (categorySlug) {
        category = await cache.tryGet(`${baseUrl}${categoryApiPath}`, async () => {
            const { data } = await got(`${baseUrl}${categoryApiPath}`, {
                searchParams: { slug: categorySlug },
            });
            if (!data || data.length === 0) {
                throw new Error(`Category "${categorySlug}" not found`);
            }
            return data[0];
        });
    }

    const categoryId = category?.id;
    const categoryName = category?.name;
    const categoryLink = category?.link;

    // get posts
    const postsUrl = `${baseUrl}${postApiPath}`;
    const postsResponse = await got(postsUrl, {
        searchParams: {
            per_page: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10,
            _embed: '',
            ...(categoryId && { categories: categoryId }),
        },
    });

    const items = postsResponse.data
        .filter((item) => item.language === 'en')
        .map((item) => {
            const featuredMedia = item._embedded?.['wp:featuredmedia']?.find((v) => v.id === item.featured_media);
            const image = featuredMedia?.source_url;
            const altText = featuredMedia?.alt_text || featuredMedia?.title?.rendered;
            let caption;
            if (featuredMedia?.caption?.rendered) {
                caption = load(featuredMedia?.caption?.rendered);
            }

            const single = {
                title: item.title.rendered,
                description: renderToString(
                    <>
                        {image ? (
                            <figure>
                                {altText ? <img src={image} alt={altText} /> : <img src={image} />}
                                <figcaption>{caption?.text() || ''}</figcaption>
                            </figure>
                        ) : null}
                        {item.content?.rendered ? raw(item.content.rendered) : null}
                    </>
                ),
                link: item.link,
                pubDate: parseDate(item.date_gmt),
                updated: parseDate(item.modified_gmt),
                image,
                author: item._embedded.author[0].name,
            };
            return single;
        });

    return {
        title: categoryName ? `Secret San Francisco - ${categoryName}` : 'Secret San Francisco',
        link: categoryLink || `${baseUrl}/${categorySlug}`,
        item: items,
    };
}
