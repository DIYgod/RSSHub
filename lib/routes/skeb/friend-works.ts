import { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import { processWork, baseUrl } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/friend_works/:username',
    categories: ['picture'],
    example: '/friend_works/@brm2_1925',
    parameters: { username: 'Skeb Username with @' },
    features: {
        requireConfig: [
            {
                name: 'Bearer Token',
                optional: false,
                description: 'Bearer Token，在瀏覽器開發者工具（F12）的主控台中輸入 `localStorage.getItem("token")` 獲取',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Skeb Friend Works',
    maintainers: ['SnowAgar25'],
    handler,
    radar: [
        {
            title: 'Friend Works',
            source: ['skeb.jp/:username'],
            target: '/friend_works/:username',
        },
    ],
    description: "Get the latest requests for the specified user's followings on Skeb.",
};

async function handler(ctx): Promise<Data> {
    const username = ctx.req.param('username');

    if (!username) {
        throw new InvalidParameterError('Invalid username');
    }

    if (!config.skeb || !config.skeb.bearer_token) {
        throw new ConfigNotFoundError('Skeb followings RSS is disabled due to the lack of relevant config');
    }

    const url = `${baseUrl}/api/users/${username.replace('@', '')}/followings`;

    const items = await cache.tryGet(`friend_works:${username}`, async () => {
        const data = await ofetch(url, {
            headers: {
                Authorization: `Bearer ${config.skeb.bearer_token}`,
            },
        });

        return data.friend_works.map((item) => processWork(item)).filter(Boolean);
    });

    return {
        title: `Skeb - ${username} - フォロー中のクライアントの新着リクエスト`,
        link: `https://skeb.jp/${username}`,
        item: items as DataItem[],
    };
}
