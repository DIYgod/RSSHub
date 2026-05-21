import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const host = 'https://techcrunch.com';
const link = `${host}/latest/`;
const rapidReadApi = `${host}/wp-json/tc/v1/rapid-read`;

export const route: Route = {
    path: '/latest',
    categories: ['new-media'],
    example: '/techcrunch/latest',
    parameters: {},
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
            source: ['techcrunch.com/latest/'],
            target: '/techcrunch/latest',
        },
    ],
    name: 'Latest',
    maintainers: ['maxlixiang'],
    handler,
    url: 'techcrunch.com/latest/',
};

async function handler(ctx) {
    const limit = getLimit(ctx);
    const { data: rapidRead } = await got.post(rapidReadApi, {
        json: {
            queryArgs: {
                post_type: ['post', 'tc_video', 'tc_podcast', 'tc_storyline'],
                order: 'DESC',
                orderby: 'date',
                post__not_in: [],
                tax_query: [],
                offset: 0,
                posts_per_page: limit,
                post_status: 'publish',
            },
            page: 1,
        },
        headers: commonHeaders,
    });

    const posts = rapidRead.posts ?? [];
    const details = await getPostDetails(posts);

    const items = posts.map((post) => normalizePost(post, details[post.id])).filter((item) => item.title && item.link);

    return {
        title: 'TechCrunch - Latest',
        link,
        description: 'The latest technology and startup news from TechCrunch.',
        item: items,
    };
}

async function getPostDetails(posts) {
    const ids = posts.map((post) => post.id).filter(Boolean);

    if (!ids.length) {
        return {};
    }

    return cache.tryGet(`techcrunch:latest:details:${ids.join(',')}`, async () => {
        const { data } = await got(`${host}/wp-json/wp/v2/posts`, {
            searchParams: {
                include: ids.join(','),
                orderby: 'include',
                per_page: ids.length.toString(),
                _embed: '1',
            },
            headers: commonHeaders,
        });

        return Object.fromEntries(data.map((post) => [post.id, post]));
    });
}

function normalizePost(post, detail) {
    const title = post.title || detail?.title?.rendered;
    const itemLink = post.link || detail?.link;
    const author = post.authors?.map((author) => author.name).filter(Boolean).join(', ');
    const category = post.terms?.map((term) => term.name).filter(Boolean);

    if (!detail) {
        return {
            title,
            link: itemLink,
            guid: itemLink || String(post.id),
            ...(author ? { author } : {}),
            ...(category?.length ? { category } : {}),
        };
    }

    const image = detail.yoast_head_json?.og_image?.[0]?.url?.split('?')[0];
    const excerpt = detail.excerpt?.rendered || '';

    return {
        title,
        link: itemLink,
        guid: detail.guid?.rendered || itemLink || String(post.id),
        author,
        category,
        pubDate: parseDate(detail.date_gmt || detail.date),
        description: buildDescription(image, excerpt),
    };
}

function getLimit(ctx) {
    const value = ctx.req.query('limit');
    const limit = value ? Number.parseInt(value, 10) : 20;

    return Number.isFinite(limit) && limit > 0 ? limit : 20;
}

const commonHeaders = {
    referer: link,
    'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
};

function buildDescription(image?: string, excerpt?: string) {
    const parts = [];

    if (image) {
        parts.push(`<p><img src="${escapeAttribute(image)}" referrerpolicy="no-referrer"></p>`);
    }

    if (excerpt) {
        parts.push(excerpt);
    }

    return parts.join('\n');
}

function escapeHtml(value: string) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttribute(value: string) {
    return escapeHtml(value).replace(/"/g, '&quot;');
}
