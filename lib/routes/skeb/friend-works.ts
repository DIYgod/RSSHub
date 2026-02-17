import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Data, DataItem, Route } from '@/types';

import { getFollowingsItems } from './utils';

export const route: Route = {
    path: '/friend_works/:username',
    categories: ['picture'],
    example: '/skeb/friend_works/@brm2_1925',
    parameters: { username: 'Skeb Username with @' },
    features: {
        requireConfig: [
            {
                name: 'SKEB_BEARER_TOKEN',
                optional: false,
                description: '在瀏覽器開發者工具（F12）的主控台中輸入 `localStorage.getItem("token")` 獲取',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Friend Works',
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

    if (!config.skeb || !config.skeb.bearerToken) {
        throw new ConfigNotFoundError('Skeb followings RSS is disabled due to the lack of relevant config');
    }

    const items = await getFollowingsItems(username, 'friend_works');

    return {
        title: `Skeb - ${username} - フォロー中のクライアントの新着リクエスト`,
        link: `https://skeb.jp/${username}`,
        item: items as DataItem[],
    };
}
