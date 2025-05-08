import { Route } from '@/types';
import got from '@/utils/got';
import getToken from '../_access';
import cache from '@/utils/cache';
import { config } from '@/config';
import constants from '../_constants';
import { getFilteredLanguages } from '../_profile';
import { getMangaMetaByIds } from '../_feed';
import { toQueryString } from '../_utils';

const DEFAULT_LIMIT = 25;

export const route: Route = {
    name: 'MDList Feed',
    path: '/mdlist/:id/:lang?',
    radar: [
        {
            source: ['mangadex.org/list/:id/:suffix'],
            target: '/mdlist/:id',
        },
    ],
    description: 'Sepcific MangaDex MDList Feed',
    example: '/mangadex/mdlist/10cca803-8dc9-4f0e-86a8-6659a3ce5188?limit=10&private=true',
    maintainers: ['chrisis58'],
    categories: ['anime'],
    parameters: {
        id: {
            description: 'The list id of the manga list',
        },
        private: {
            description: '(Query Param) Needed to access private lists, any value will be treated as true',
        },
    },
    features: {
        requireConfig: [
            {
                name: 'MANGADEX_USERNAME',
                description: 'MangaDex Username, required when refresh-token is not set and the list is private',
                optional: true,
            },
            {
                name: 'MANGADEX_PASSWORD',
                description: 'MangaDex Password, required when refresh-token is not set and the list is private',
                optional: true,
            },
            {
                name: 'MANGADEX_CLIENT_ID',
                description: 'MangaDex Client ID, required when the list is private',
                optional: true,
            },
            {
                name: 'MANGADEX_CLIENT_SECRET',
                description: 'MangaDex Client Secret, required when the list is private',
                optional: true,
            },
            {
                name: 'MANGADEX_REFRESH_TOKEN',
                description: 'MangaDex Refresh Token, required when username and password are not set and the list is private',
                optional: true,
            },
        ],
    },
    handler,
};

async function handler(ctx) {
    const { id, lang } = ctx.req.param();

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : DEFAULT_LIMIT;
    const isPrivate = !!ctx.req.query('private');

    const accessToken = isPrivate ? await getToken() : undefined;

    const languagesQuery = new Set([...(typeof lang === 'string' ? [lang] : lang || []), ...(await getFilteredLanguages())].filter(Boolean));

    const { listName, listAuthor } = (await cache.tryGet(
        `mangadex:mdlist-info-${id}`,
        async () => {
            const response = await got.get(
                `${constants.API.BASE}/list/${id}${toQueryString({
                    includes: ['user'],
                })}`,
                {
                    headers: {
                        Authorization: String(isPrivate ? `Bearer ${accessToken}` : ''),
                        'User-Agent': config.trueUA,
                    },
                }
            );

            const mdlistInfo = response?.data?.data;
            if (!mdlistInfo) {
                throw new Error('Failed to retrieve user follows from MangaDex API.');
            }

            const listName = mdlistInfo.attributes.name;
            const listAuthor = mdlistInfo.relationships.find((relationship) => relationship.type === 'user')?.attributes.username;

            return { listName, listAuthor };
        },
        config.cache.contentExpire
    )) as Record<string, any>;

    const feed = (await cache.tryGet(
        `mangadex:mdlist-feed-${id}`,
        async () => {
            const response = await got.get(
                `${constants.API.BASE}/list/${id}/feed${toQueryString({
                    limit,
                    translatedLanguage: languagesQuery,
                    order: {
                        publishAt: 'desc',
                    },
                })}`,
                {
                    headers: {
                        Authorization: String(isPrivate ? `Bearer ${accessToken}` : ''),
                        'User-Agent': config.trueUA,
                    },
                }
            );

            const feed = response?.data?.data;
            if (!feed) {
                throw new Error('Failed to retrieve user follows from MangaDex API.');
            }

            return feed;
        },
        config.cache.routeExpire,
        false
    )) as Record<string, any>[];

    const mangaIds = feed.map((chapter) => chapter?.relationships.find((relationship) => relationship.type === 'manga')?.id);

    const mangaMetas = await getMangaMetaByIds(mangaIds);

    return {
        title: `MDList - ${listName} by ${listAuthor}`,
        link: `https://mangadex.org/list/${id}?tab=feed`,
        description: 'The latest updates of all the manga in a sepcific list',
        item: feed.map((chapter) => {
            const mangaId = chapter.relationships.find((relationship) => relationship.type === 'manga')?.id;
            const mangaMeta = mangaMetas.get(mangaId);
            const chapterTitile = [chapter.attributes.volume ? `Vol. ${chapter.attributes.volume}` : null, chapter.attributes.chapter ? `Ch. ${chapter.attributes.chapter}` : null, chapter.attributes.title].filter(Boolean).join(' ');

            return {
                title: mangaMeta?.title || 'Unknown',
                link: `${constants.API.MANGA_CHAPTERS}${chapter.id}`,
                pubDate: new Date(chapter.attributes.publishAt),
                description: chapterTitile,
                image: mangaMeta?.cover,
            };
        }),
    };
}
