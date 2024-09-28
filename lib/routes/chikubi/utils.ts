import { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const CONTENT_TYPES = {
    doujin: {
        title: '.doujin-title',
        description: ['.doujin-detail', '.section', '.area-buy > a.btn'],
    },
    video: {
        title: '.video-title',
        description: ['.video-data', '.section', '.lp-samplearea a.btn'],
    },
    article: {
        title: '.article_title',
        description: ['.article_icatch', '.article_contents'],
    },
};

function getContentType(link: string): keyof typeof CONTENT_TYPES {
    const typePatterns = {
        doujin: ['/cg/', '/comic/', '/voice/'],
        video: ['/nipple-video/'],
        article: ['/post-'],
    };

    for (const [type, patterns] of Object.entries(typePatterns)) {
        if (patterns.some((pattern) => link.includes(pattern))) {
            return type as keyof typeof CONTENT_TYPES;
        }
    }

    throw new Error(`Unknown content type for link: ${link}`);
}

export async function processItems(list): Promise<DataItem[]> {
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = load(detailResponse.data);

                const contentType = getContentType(item.link);
                const selectors = CONTENT_TYPES[contentType];

                const title = $(selectors.title).text().trim() || item.title;
                const description = processDescription(selectors.description.map((selector) => $(selector).prop('outerHTML')).join(''));

                const pubDateStr = $('meta[property="article:published_time"]').attr('content');
                const pubDate = pubDateStr ? parseDate(pubDateStr) : undefined;

                return {
                    title,
                    description,
                    link: item.link,
                    pubDate,
                } as DataItem;
            })
        )
    );

    return items.filter((item): item is DataItem => item !== null);
}

function processDescription(description: string): string {
    const $ = load(description);
    return $('body')
        .children()
        .map((_, el) => $(el).clone().wrap('<div>').parent().html())
        .toArray()
        .join('');
}

const WP_REST_API_URL = 'https://chikubi.jp/wp-json/wp/v2';

export async function getPosts(ids?: string[]): Promise<DataItem[]> {
    const url = `${WP_REST_API_URL}/posts${ids?.length ? `?include=${ids.join(',')}` : ''}`;

    const cachedData = await cache.tryGet(url, async () => {
        const response = await got(url);
        const data = JSON.parse(response.body);

        if (!Array.isArray(data)) {
            throw new TypeError('No posts found for the given IDs');
        }

        return data.map(({ title, link, date, content }) => ({
            title: title.rendered,
            link,
            pubDate: parseDate(date),
            description: processDescription(content.rendered),
        }));
    });

    return (Array.isArray(cachedData) ? cachedData : []).filter((item): item is DataItem => item !== null);
}

const API_TYPES = {
    tag: 'tags',
    category: 'categories',
};

export async function getBySlug<T extends keyof typeof API_TYPES>(type: T, slug: string): Promise<{ id: number; name: string }> {
    const url = `${WP_REST_API_URL}/${API_TYPES[type]}?slug=${encodeURIComponent(slug)}`;
    const { body } = await got(url);
    const data = JSON.parse(body);

    if (data?.[0]) {
        const { id, name } = data[0];
        return { id, name };
    }
    throw new Error(`No ${type} found for slug: ${slug}`);
}

export async function getPostsBy<T extends keyof typeof API_TYPES>(type: T, id: number): Promise<DataItem[]> {
    const url = `${WP_REST_API_URL}/posts?${API_TYPES[type]}=${id}`;
    const cachedData = await cache.tryGet(url, async () => {
        const { body } = await got(url);
        const data = JSON.parse(body);

        if (Array.isArray(data) && data.length > 0) {
            return data.map(({ title, link, date, content }) => ({
                title: title.rendered,
                link,
                pubDate: parseDate(date),
                description: processDescription(content.rendered),
            }));
        }
        return [];
    });

    return (Array.isArray(cachedData) ? cachedData : []).filter((item): item is DataItem => item !== null);
}
