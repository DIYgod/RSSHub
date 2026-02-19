import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import getToken from '../_access';
import constants from '../_constants';
import { getMangaMetaByIds } from '../_feed';
import { getFilteredLanguages } from '../_profile';
import { toQueryString } from '../_utils';

const DEFAULT_LIMIT = 25;

export const route: Route = {
    path: '/user/feed/follow/:lang?',
    name: ' Follows Feed',
    maintainers: ['chrisis58'],
    description: 'Get the latest updates of all the manga you follow on MangaDex.',
    example: '/mangadex/user/feed/follow/zh?limit=10',
    radar: [
        {
            source: ['mangadex.org/titles/feed'],
            target: '/user/feed/follow',
        },
    ],
    categories: ['anime'],
    parameters: {
        lang: {
            description: 'The language of the followed manga',
        },
    },
    features: {
        requireConfig: [
            {
                name: 'MANGADEX_USERNAME',
                description: 'MangaDex Username, required when refresh-token is not set',
                optional: true,
            },
            {
                name: 'MANGADEX_PASSWORD',
                description: 'MangaDex Password, required when refresh-token is not set',
                optional: true,
            },
            {
                name: 'MANGADEX_CLIENT_ID',
                description: 'MangaDex Client ID',
                optional: false,
            },
            {
                name: 'MANGADEX_CLIENT_SECRET',
                description: 'MangaDex Client Secret',
                optional: false,
            },
            {
                name: 'MANGADEX_REFRESH_TOKEN',
                description: 'MangaDex Refresh Token, required when username and password are not set',
                optional: true,
            },
        ],
        nsfw: true,
    },
    handler,
};

async function handler(ctx) {
    const userFollowUrl = `${constants.API.BASE}/user/follows/manga/feed`;

    const { lang } = ctx.req.param();

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : DEFAULT_LIMIT;

    const accessToken = await getToken();

    const languagesQuery = new Set([...(typeof lang === 'string' ? [lang] : lang || []), ...(await getFilteredLanguages())].filter(Boolean));

    const feed = (await cache.tryGet(
        'mangadex:user-follows',
        async () => {
            const response = await got.get(
                `${userFollowUrl}${toQueryString({
                    translatedLanguage: languagesQuery,
                    order: {
                        publishAt: 'desc',
                    },
                    limit,
                })}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'User-Agent': config.trueUA,
                    },
                }
            );

            const followedChapterFeed = response?.data?.data;
            if (!followedChapterFeed) {
                throw new Error('Failed to retrieve user follows from MangaDex API.');
            }

            return followedChapterFeed;
        },
        config.cache.routeExpire,
        false
    )) as Array<Record<string, any>>;

    const mangaIds = feed.map((chapter) => chapter?.relationships.find((relationship) => relationship.type === 'manga')?.id);

    const mangaMetas = await getMangaMetaByIds(mangaIds);

    return {
        title: 'User Follows',
        link: 'https://mangadex.org/titles/feed',
        description: 'The latest updates of all the manga you follow on MangaDex.',
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
