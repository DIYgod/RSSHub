import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/:category?',
    categories: ['programming'],
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

    let categoryId;
    let categoryResponse;
    if (categorySlug) {
        categoryResponse = await got(`${baseUrl}${categoryApiPath}`, {
            searchParams: {
                slug: categorySlug,
            },
        });
        if (!categoryResponse.body || categoryResponse.body.length === 0) {
            throw new Error(`Category "${categorySlug}" not found`);
        }
        categoryId = categoryResponse.data[0].id;
    }

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
            const altText = featuredMedia?.alt_text || featuredMedia?.title?.rendered || 'Featured Image';

            const single = {
                title: item.title.rendered,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    content: item.content.rendered,
                    image,
                    altText,
                }),
                link: item.link,
                pubDate: parseDate(item.date_gmt),
                updated: parseDate(item.modified_gmt),
                image,
                author: item._embedded.author[0].name,
                category: [...new Set(item._embedded['wp:term'].flatMap((i) => i.map((j) => j.name)))],
            };
            return single;
        });

    const categoryName = categoryResponse?.data?.[0]?.name;
    const categoryLink = categoryResponse?.data?.[0]?.link;

    return {
        title: categoryName ? `Secret San Francisco - ${categoryName}` : 'Secret San Francisco',
        link: categoryLink || `${baseUrl}/${categorySlug}`,
        item: items,
    };
}
