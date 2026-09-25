import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

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

// graphql reports failures with http 200 and a null `data`, so errors have to be checked explicitly
const graphql = async (query: string, variables: Record<string, unknown>) => {
    const response = await ofetch(apiUrl, {
        method: 'POST',
        body: { query, variables },
    });

    if (!response.data) {
        throw new Error(response.errors?.map((error) => error.message).join('; ') ?? 'empty GraphQL response');
    }

    return response.data;
};

// the article body is a tree of layout blocks; only HTMLElement and ImageWithBadge carry content,
// everything else (Grid, NewswireTitle, Rating, ...) just nests further blocks under `content`
const renderBlocks = (node: any): string => {
    if (Array.isArray(node)) {
        return node.map((child) => renderBlocks(child)).join('');
    }
    if (!node || typeof node !== 'object') {
        return '';
    }
    switch (node._template) {
        case 'HTMLElement':
            return node._memoq?.content ?? '';
        case 'ImageWithBadge': {
            const source = node.image?.sources?.[locale]?.desktop;
            return source ? `<img src="${mediaUrl}${source}">` : '';
        }
        default:
            return renderBlocks(node.content);
    }
};

async function handler() {
    const data = await graphql(listQuery, { locale, page: 1, limit: 20, metaUrl: '/newswire' });

    const item = await Promise.all(
        data.posts.results.map((post) => {
            const link = `${baseUrl}${post.url}`;

            return cache.tryGet(link, async () => {
                const { post: article } = await graphql(postQuery, { id_hash: post.id, locale });
                const { subtitle, tina } = article ?? {};

                return {
                    title: post.title,
                    link,
                    // timestamps carry no timezone and are always rockstar's local time (new york), regardless of locale
                    pubDate: dayjs(parseDate(post.created, 'M/D/YY, h:mm A')).tz('America/New_York', true).toDate(),
                    category: [...(post.primary_tags ?? []), ...(post.secondary_tags ?? [])].map((tag) => tag.name),
                    description: (subtitle ? `<p><em>${subtitle}</em></p>` : '') + renderBlocks(tina?.payload?.content),
                };
            });
        })
    );

    return {
        title: `${data.meta.title} - Rockstar Games`,
        link: `${baseUrl}/newswire`,
        item,
    };
}
