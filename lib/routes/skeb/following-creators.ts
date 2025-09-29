import { Data, DataItem, Route } from '@/types';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import { getFollowingsItems } from './utils';

export const route: Route = {
    path: '/following_creators/:username',
    categories: ['picture'],
    example: '/skeb/following_creators/@brm2_1925',
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
    name: 'Following Creators',
    maintainers: ['SnowAgar25'],
    handler,
    radar: [
        {
            title: 'Following Creators',
            source: ['skeb.jp/:username'],
            target: '/following_creators/:username',
        },
    ],
    description: 'Get the list of creators the specified user is following on Skeb.',
};

async function handler(ctx): Promise<Data> {
    const username = ctx.req.param('username');

    if (!config.skeb || !config.skeb.bearerToken) {
        throw new ConfigNotFoundError('Skeb followings RSS is disabled due to the lack of relevant config');
    }

    const items = await getFollowingsItems(username, 'following_creators');

    return {
        title: `Skeb - ${username} - フォロー中のクリエイター`,
        link: `https://skeb.jp/${username}`,
        item: items as DataItem[],
    };
}
