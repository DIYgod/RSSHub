import { Route } from '@/types';
import got from '@/utils/got';
import getToken from '../_access';
import cache from '@/utils/cache';
import { config } from '@/config';
import { getMangaChapters, getMangaMetaByIds } from '../_feed';

type FollowType = 'reading' | 'plan-to-read' | 'completed' | 'on-hold' | 're-reading' | 'dropped';
type StatusType = 'reading' | 'plan_to_read' | 'completed' | 'on_hold' | 're_reading' | 'dropped';
type LabelType = 'Reading' | 'Plan to Read' | 'Completed' | 'On Hold' | 'Re-reading' | 'Dropped';

const statusMap: Record<FollowType, StatusType> = {
    reading: 'reading',
    'plan-to-read': 'plan_to_read',
    completed: 'completed',
    'on-hold': 'on_hold',
    're-reading': 're_reading',
    dropped: 'dropped',
};

const labelMap: Record<FollowType, LabelType> = {
    reading: 'Reading',
    'plan-to-read': 'Plan to Read',
    completed: 'Completed',
    'on-hold': 'On Hold',
    're-reading': 'Re-reading',
    dropped: 'Dropped',
};

export const route: Route = {
    path: '/user/follow/:type?',
    name: "Logged User's Followed Mangas Feed",
    maintainers: ['chrisis58'],
    example: '/mangadex/user/follow/reading',
    description: `Fetches the feed of mangas that you follow on MangaDex whick are in the specified status.
CAUTION: With big amount of follows, it may take a long time to load or even fail.
It's recommended to use the \`/mangadex/mdlist/:listId?\` route instead for better performance, though it requires manual configuration.`,
    categories: ['anime'],
    parameters: {
        type: {
            description: 'The type of follows to fetch',
            default: 'reading',
            options: [
                { value: 'reading', label: 'Reading' },
                { value: 'plan-to-read', label: 'Plan to Read' },
                { value: 'completed', label: 'Completed' },
                { value: 'on-hold', label: 'On Hold' },
                { value: 're-reading', label: 'Re-reading' },
                { value: 'dropped', label: 'Dropped' },
            ],
        },
    },
    radar: [
        {
            source: ['mangadex.org/titles/follows'],
            target: '/user/follow/reading',
        },
    ],
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
    const userFollowUrl = 'https://api.mangadex.org/manga/status';

    const { type } = ctx.req.param();

    const followType = (type || 'reading') as FollowType;

    const accessToken = await getToken();

    const statuses = (await cache.tryGet(
        `mangadex:user-follow-${followType}`,
        async () => {
            const response = await got.get(userFollowUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'User-Agent': config.trueUA,
                },
            });

            const statuses = response?.data?.statuses;
            if (!statuses) {
                throw new Error('Failed to retrieve user follows from MangaDex API.');
            }

            return statuses;
        },
        config.cache.routeExpire,
        false
    )) as Record<string, string>;

    const mangaIds = filterByValue(statuses, statusMap[followType]);

    const mangaMetaMap = await getMangaMetaByIds(mangaIds);

    const mangaChapters = await Promise.all(mangaIds.map((id) => getMangaChapters(id, undefined, 10)));

    const mangas = mangaChapters.flatMap((chapters, index) => {
        const mangaMeta = mangaMetaMap.get(mangaIds[index]);
        return chapters.map((chapter) => ({
            title: mangaMeta?.title ?? 'Unknown',
            link: chapter.link,
            pubDate: chapter.pubDate,
            description: chapter.title ?? '',
            image: mangaMeta?.cover ?? '',
        }));
    });

    return {
        title: `User Follows - ${labelMap[followType]} Mangas`,
        link: `https://mangadex.org/titles/follows?tab=${followType}`,
        description: 'Followed Mangas',
        item: mangas,
    };
}

const filterByValue = (record: Record<string, string>, value: string): string[] =>
    Object.entries(record)
        .filter(([, v]) => v === value)
        .map(([k]) => k);
