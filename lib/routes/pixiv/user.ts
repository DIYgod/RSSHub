import { Route } from '@/types';
import cache from '@/utils/cache';
import { getToken } from './token';
import getIllusts from './api/get-illusts';
import { config } from '@/config';
import pixivUtils from './utils';
import { parseDate } from '@/utils/parse-date';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/user/:id',
    categories: ['social-media', 'popular'],
    example: '/pixiv/user/15288095',
    parameters: { id: "user id, available in user's homepage URL" },
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
            source: ['www.pixiv.net/users/:id'],
        },
    ],
    name: 'User Activity',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw new ConfigNotFoundError('pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const id = ctx.req.param('id');
    const token = await getToken(cache.tryGet);
    if (!token) {
        throw new ConfigNotFoundError('pixiv not login');
    }

    const response = await getIllusts(id, token);

    const illusts = response.data.illusts;
    const username = illusts[0].user.name;

    return {
        title: `${username} 的 pixiv 动态`,
        link: `https://www.pixiv.net/users/${id}`,
        image: illusts[0].user.profile_image_urls.medium,
        description: `${username} 的 pixiv 最新动态`,
        item: illusts.map((illust) => {
            const images = pixivUtils.getImgs(illust);
            return {
                title: illust.title,
                author: username,
                pubDate: parseDate(illust.create_date),
                description: `${illust.caption}<br><p>画师：${username} - 阅览数：${illust.total_view} - 收藏数：${illust.total_bookmarks}</p>${images.join('')}`,
                link: `https://www.pixiv.net/artworks/${illust.id}`,
                category: illust.tags.map((t) => t.name),
            };
        }),
    };
}
