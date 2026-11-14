import { type CheerioAPI, load } from 'cheerio';
import { decodeHTML } from 'entities/decode';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import { config } from '@/config';
import { renderYoutube } from '@/routes/youtube/utils';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { fetchFeaturedPosts } from './api';

export const route: Route = {
    path: '/today',
    categories: ['other'],
    example: '/producthunt/today',
    features: {
        requireConfig: [
            {
                name: 'PRODUCTHUNT_ACCESS_TOKEN',
                description: 'Optional API access token for the featured daily list when the website is unavailable. See [Product Hunt API documentation](https://api.producthunt.com/v2/docs).',
                optional: true,
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    description: 'Top products from the publisher’s Today list. The general Product Hunt feed is also available at `/producthunt/feed`.',
    radar: [
        {
            source: ['www.producthunt.com/'],
        },
    ],
    name: 'Top Products Launching Today',
    maintainers: ['miaoyafeng', 'Fatpandac'],
    handler,
    url: 'www.producthunt.com/',
};

async function handler(): Promise<Data> {
    const feed = { title: 'Product Hunt Today Popular', link: 'https://www.producthunt.com/', language: 'en' as const };
    if (config.producthunt.accessToken) {
        return { ...feed, sortItems: false, item: await fetchFeaturedPosts(config.producthunt.accessToken) };
    }

    let response: string;
    try {
        response = await ofetch<string, 'text'>('https://www.producthunt.com/', { responseType: 'text', headers: { 'User-Agent': config.trueUA } });
    } catch (error) {
        throw new Error('Product Hunt’s Today list is unavailable. /producthunt/feed provides the general feed.', { cause: error });
    }

    const $ = load(response);
    const data = parseTransport($).flatMap((snapshot) => snapshot.events ?? []);
    const todayList = data.find((event) => event.type === 'next' && event.value?.data?.homefeed)?.value.data.homefeed.edges.find((edge) => edge.node.id === 'FEATURED-0')?.node;
    if (!todayList) {
        throw new Error('Product Hunt did not return the Today list. /producthunt/feed provides the general feed.');
    }
    // 0: Top Products Launching Today
    // 1: Yesterday's Top Products
    // 2: Last Week's Top Products
    // 3: Last Month's Top Products

    const posts: FeaturedPost[] = todayList.items;
    const list = posts
        .filter((i) => i.__typename === 'Post')
        .map((item): LaunchItem => ({
            title: item.name,
            guid: item.id,
            link: `https://www.producthunt.com/products/${item.product.slug}`,
            postSlug: item.slug,
            description: item.tagline,
            pubDate: parseDate(item.createdAt),
            image: `https://ph-files.imgix.net/${item.thumbnailImageUuid}`,
            category: item.topics?.edges.map((topic) => topic.node.name),
        }));

    const items = await pMap(
        list,
        async ({ postSlug, ...item }) => {
            try {
                const details = await cache.tryGet(`producthunt:launch:v3:${postSlug}`, async () => {
                    const response = await ofetch<string, 'text'>(`https://www.producthunt.com/posts/${postSlug}`, {
                        responseType: 'text',
                        headers: { 'User-Agent': config.trueUA },
                    });
                    const post = findPost(parseTransport(load(response)), postSlug);
                    if (!post) {
                        throw new Error(`Product Hunt launch metadata was not found for ${postSlug}.`);
                    }

                    return {
                        author: post.user?.name,
                        description: renderDescription({
                            tagline: post.tagline,
                            description: post.description,
                            media: post.media,
                        }),
                    };
                });
                return { ...item, ...details };
            } catch {
                return item;
            }
        },
        { concurrency: 3 }
    );

    return { ...feed, sortItems: false, item: items };
}

type MediaItem = {
    mediaType?: string;
    imageUuid?: string;
    metadata?: {
        platform?: string;
        videoId?: string;
    };
};

type DescriptionProps = {
    tagline?: string;
    description?: string;
    media?: MediaItem[];
};

const renderDescription = ({ tagline, description, media }: DescriptionProps): string =>
    renderToString(
        <>
            {tagline ? <blockquote>{tagline}</blockquote> : null}
            {description ? <div>{decodeHTML(description)}</div> : null}
            {media?.map((item) => {
                if (item.mediaType === 'image' && item.imageUuid) {
                    return (
                        <>
                            <img src={`https://ph-files.imgix.net/${item.imageUuid}`} />
                            <br />
                        </>
                    );
                }

                if (item.mediaType === 'video' && item.metadata?.platform === 'youtube' && item.metadata.videoId) {
                    return raw(renderYoutube(true, item.metadata.videoId, undefined, undefined));
                }

                return null;
            })}
        </>
    );

function parseTransport($: CheerioAPI) {
    return $('script:contains("ApolloSSRDataTransport")')
        .toArray()
        .flatMap((script) => {
            const match = $(script)
                .text()
                .match(/\.push\(([\s\S]+)\)\s*;?$/);
            if (!match) {
                return [];
            }
            // The transport is JSON with occasional unquoted undefined values.
            let json = '';
            let quoted = false;
            let escaped = false;
            for (let i = 0; i < match[1].length; i++) {
                const char = match[1][i];
                if (!quoted && match[1].startsWith('undefined', i)) {
                    json += 'null';
                    i += 8;
                    continue;
                }
                json += char;
                if (escaped) {
                    escaped = false;
                } else if (quoted && char === '\\') {
                    escaped = true;
                } else if (char === '"') {
                    quoted = !quoted;
                }
            }
            return [JSON.parse(json)];
        });
}

function findPost(value, slug: string): (DescriptionProps & { user?: { name?: string } }) | undefined {
    if (!value || typeof value !== 'object') {
        return;
    }
    if (value.__typename === 'Post' && value.slug === slug && typeof value.description === 'string') {
        return value;
    }
    for (const child of Object.values(value)) {
        const post = findPost(child, slug);
        if (post) {
            return post;
        }
    }
}

interface FeaturedPost {
    id: string;
    __typename: string;
    name: string;
    product: { slug: string };
    slug: string;
    tagline: string;
    createdAt: string;
    thumbnailImageUuid: string;
    topics: { edges: Array<{ node: { name: string } }> };
}

type LaunchItem = DataItem & { link: string; postSlug: string };
