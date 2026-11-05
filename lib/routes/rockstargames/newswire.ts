import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { escapeAttribute, escapeText } from 'entities';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

dayjs.extend(utc);
dayjs.extend(timezone);

export const route: Route = {
    path: '/newswire',
    categories: ['game'],
    example: '/rockstargames/newswire',
    url: 'www.rockstargames.com/newswire',
    radar: [
        {
            source: ['www.rockstargames.com/newswire'],
        },
    ],
    name: 'Newswire',
    maintainers: ['dapexyz'],
    handler,
};

const baseUrl = 'https://www.rockstargames.com';
const mediaUrl = 'https://media-rockstargames-com.akamaized.net';
const apiUrl = 'https://graph.rockstargames.com/';
const locale = 'en_us';

const listQuery = /* GraphQL */ `
    fragment postFields on RockstarGames_Newswire_Model_Entity_Post_o {
        id: id_hash
        url
        title
        created
        primary_tags {
            name
        }
        secondary_tags {
            name
        }
    }
    query NewswireList($locale: String!, $page: Int!, $limit: Int, $metaUrl: String!) {
        meta: metaUrl(url: $metaUrl, domain: "www", locale: $locale) {
            title
        }
        posts(page: $page, locale: $locale, limit: $limit) {
            results {
                ...postFields
            }
        }
    }
`;

const postQuery = /* GraphQL */ `
    query NewswirePost($id_hash: String!, $locale: String!) {
        post(id_hash: $id_hash, locale: $locale) {
            subtitle
            tina {
                payload
            }
        }
    }
`;

const videoQuery = /* GraphQL */ `
    query NewswireVideo($id: String!, $locale: String!) {
        video(id: $id, locale: $locale, context: "embed") {
            screencap
            files {
                resolution
                src
                default
            }
        }
    }
`;

type Video = {
    screencap?: string;
    files?: Array<{ resolution?: string; src?: string; default?: boolean }>;
};

// graphql reports failures with http 200 and a null `data`, so errors have to be checked explicitly
const graphql = async (query: string, variables: Record<string, string | number>) => {
    const response = await ofetch(apiUrl, {
        method: 'POST',
        body: { query, variables },
    });

    if (!response.data) {
        throw new Error(response.errors?.map((error) => error.message).join('; ') ?? 'empty GraphQL response');
    }

    return response.data;
};

type Image = {
    alt?: string;
    _memoq?: { alt?: string };
    sources?: Record<string, string | { desktop?: string; mobile?: string }>;
};

type JsonValue = string | number | boolean | null | undefined | JsonValue[] | { [key: string]: JsonValue };

type Block = {
    _template?: string;
    _memoq?: { content?: string; description?: string; text?: string; title?: string; to?: string };
    image?: Image;
    plainImage?: { image?: Image };
    images?: Block[];
    content?: Block | Block[];
    items?: Block[];
    discountsGridList?: { content?: Block[] };
    top?: { _memoq?: { text?: string } };
    bottom?: { _memoq?: { text?: string } };
    id?: string;
    embed?: string;
    name?: string;
};

const isBlock = (node: JsonValue): node is Block => node !== null && typeof node === 'object';

const renderImage = (image?: Image): string => {
    const sources = image?.sources?.[locale];
    const source = typeof sources === 'string' ? sources : (sources?.desktop ?? sources?.mobile);
    return source ? `<img src="${escapeAttribute(new URL(source, mediaUrl).href)}" alt="${escapeAttribute(image?._memoq?.alt ?? image?.alt ?? '')}">` : '';
};

const collectVideoIds = (node: JsonValue): string[] => {
    if (Array.isArray(node)) {
        return node.flatMap((child) => collectVideoIds(child));
    }
    if (!isBlock(node)) {
        return [];
    }
    return [...(node._template === 'RockstarVideoPlayer' && node.id ? [node.id] : []), ...Object.values(node).flatMap((child) => collectVideoIds(child))];
};

const renderBlocks = (node: JsonValue, videos: Map<string, Video | undefined>): string => {
    if (Array.isArray(node)) {
        return node.map((child) => renderBlocks(child, videos)).join('');
    }
    if (!isBlock(node)) {
        return '';
    }
    switch (node._template) {
        case 'RockstarVideoPlayer': {
            const video = node.id ? videos.get(node.id) : undefined;
            const file = video?.files?.find((file) => file.resolution === '1080p') ?? video?.files?.find((file) => file.default) ?? video?.files?.[0];
            return file?.src ? `<video controls src="${escapeAttribute(file.src)}"${video?.screencap ? ` poster="${escapeAttribute(video.screencap)}"` : ''}></video>` : '';
        }
        case 'NewswireTitle':
            return renderBlocks(node.content, videos);
        case 'HTMLElement':
            return node._memoq?.content ?? '';
        case 'ImageWithBadge':
        case 'Lightbox':
            return renderImage(node.image);
        case 'GroupOfItems':
        case 'Carousel':
        case 'Discounts':
        case 'Embed':
            return renderBlocks(node.items, videos);
        case 'FeaturedEventInfo':
        case 'EventInfo':
            return (node._memoq?.title ? `<h3>${escapeText(node._memoq.title)}</h3>` : '') + renderBlocks(node.images, videos) + renderBlocks(node.content, videos);
        case 'GamingRewards':
            return renderImage(node.plainImage?.image) + (node.top?._memoq?.text ?? '') + (node.bottom?._memoq?.text ?? '');
        case '0': {
            const title = node._memoq?.title;
            const heading = title ? escapeText(title) : '';
            const linkedHeading = node._memoq?.to ? `<a href="${escapeAttribute(new URL(node._memoq.to, baseUrl).href)}">${heading}</a>` : heading;
            return renderImage(node.image) + (title ? `<h3>${linkedHeading}</h3>` : '') + (node._memoq?.description ?? '') + renderBlocks(node.content, videos);
        }
        case '1':
            return node.embed ?? '';
        case '2':
            return (node.name ? `<h3>${escapeText(node.name)}</h3>` : '') + renderBlocks(node.discountsGridList?.content, videos);
        default:
            return renderBlocks(node.content, videos);
    }
};

type Post = {
    id: string;
    url: string;
    title: string;
    created: string;
    primary_tags?: Array<{ name: string }>;
    secondary_tags?: Array<{ name: string }>;
};

async function handler() {
    const data = await graphql(listQuery, { locale, page: 1, limit: 20, metaUrl: '/newswire' });

    const posts: Post[] = data.posts.results;
    const item = await pMap(
        posts,
        async (post) => {
            const link = `${baseUrl}${post.url}`;

            const description = await cache.tryGet(`rockstargames:newswire-body:v3:${link}`, async () => {
                const { post: article } = await graphql(postQuery, { id_hash: post.id, locale });
                const { subtitle, tina } = article ?? {};
                const videoIds = [...new Set(collectVideoIds(tina?.payload?.content))];
                const videos = new Map(
                    await pMap(
                        videoIds,
                        async (id) => {
                            const video = await cache.tryGet(`rockstargames:video:v1:${locale}:${id}`, async (): Promise<Video | undefined> => (await graphql(videoQuery, { id, locale })).video ?? undefined);
                            return [id, video] as const;
                        },
                        { concurrency: 3 }
                    )
                );
                return (subtitle ? `<p><em>${subtitle}</em></p>` : '') + renderBlocks(tina?.payload?.content, videos);
            });

            return {
                title: post.title,
                link,
                // timestamps carry no timezone and are always rockstar's local time (new york), regardless of locale
                pubDate: post.created ? dayjs(parseDate(post.created, 'M/D/YY, h:mm A')).tz('America/New_York', true).toDate() : undefined,
                category: [...(post.primary_tags ?? []), ...(post.secondary_tags ?? [])].map((tag) => tag.name),
                description,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: `${data.meta.title} - Rockstar Games`,
        link: `${baseUrl}/newswire`,
        item,
    };
}
