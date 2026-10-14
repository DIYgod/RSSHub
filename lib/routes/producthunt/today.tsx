import { type CheerioAPI, load } from 'cheerio';
import { decodeHTML } from 'entities/decode';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import { config } from '@/config';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/today',
    categories: ['other'],
    example: '/producthunt/today',
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
            source: ['www.producthunt.com/'],
        },
    ],
    name: 'Top Products Launching Today',
    maintainers: ['miaoyafeng', 'Fatpandac'],
    handler,
    url: 'www.producthunt.com/',
};

async function handler(): Promise<Data> {
    const response = await ofetch('https://www.producthunt.com/', {
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const $ = load(response);
    const data = parseTransport($).flatMap((snapshot) => snapshot.events ?? []);
    const todayList = data.find((event) => event.type === 'next' && event.value?.data?.homefeed)?.value.data.homefeed.edges.find((edge) => edge.node.id === 'FEATURED-0')?.node;
    if (!todayList) {
        throw new Error('Product Hunt featured feed was not found in the public page.');
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
            category: item.topics.edges.map((topic) => topic.node.name),
        }));

    const items = await pMap(
        list,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`producthunt:launch:v3:${item.postSlug}`, async () => {
                const response = await ofetch(`https://www.producthunt.com/posts/${item.postSlug}`, {
                    headers: { 'User-Agent': config.trueUA },
                });
                const post = findPost(parseTransport(load(response)), item.postSlug);
                if (!post) {
                    throw new Error(`Product Hunt launch metadata was not found for ${item.postSlug}.`);
                }

                return {
                    author: post.user?.name,
                    description: renderDescription({
                        tagline: post.tagline,
                        description: post.description,
                        media: post.media,
                    }),
                };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: 'Product Hunt Today Popular',
        link: 'https://www.producthunt.com/',
        language: 'en',
        item: items.map((post) => {
            const item = { ...post };
            Reflect.deleteProperty(item, 'postSlug');
            return item;
        }),
    };
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
                    return <iframe id="ytplayer" type="text/html" width="640" height="360" src={`https://www.youtube-nocookie.com/embed/${item.metadata.videoId}`} frameborder="0" allowfullscreen></iframe>;
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
