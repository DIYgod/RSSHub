import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['shopping'],
    example: '/thegadgetflow/cool-gadgets-gifts',
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
            source: ['thegadgetflow.com/categories/:category', 'thegadgetflow.com/collections/:category'],
            target: '/:category',
        },
    ],
    name: 'Category',
    maintainers: ['IvanWng97'],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'https://thegadgetflow.com';
    const categoryApiPath = '/wp-json/wp/v2/collection';
    const postApiPath = '/wp-json/wp/v2/posts';

    // get category number
    const categorySlug = ctx.req.param('category') || '';
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isFinite(requestedLimit) && requestedLimit >= 1 ? Math.min(Math.floor(requestedLimit), 100) : 10;

    let category;
    if (categorySlug) {
        category = await cache.tryGet(`${baseUrl}${categoryApiPath}:${categorySlug}`, async () => {
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
            per_page: limit,
            _embed: '',
            ...(categoryId && { collection: categoryId }),
        },
    });

    const items = postsResponse.data.map((item) => {
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
                            <img src={image} alt={altText} />
                            <figcaption>{caption?.text() || ''}</figcaption>
                        </figure>
                    ) : null}
                    {item.content.rendered ? raw(item.content.rendered) : null}
                </>
            ),
            link: item.link,
            pubDate: item.date_gmt ? parseDate(`${item.date_gmt}Z`) : undefined,
            updated: item.modified_gmt ? parseDate(`${item.modified_gmt}Z`) : undefined,
            // image,
            author:
                item._embedded?.author
                    ?.map((author) => author.name)
                    .filter(Boolean)
                    .join(', ') || undefined,
            category: item._embedded?.['wp:term']?.flat().map((term) => term.name),
        };
        return single;
    });

    return {
        title: categoryName ? `Gadget Flow - ${categoryName}` : 'Gadget Flow',
        link: categoryLink || `${baseUrl}/${categorySlug}`,
        item: items,
    };
}
