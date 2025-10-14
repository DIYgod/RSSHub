import { Route } from '@/types';
import cache from '@/utils/cache';
import { getToken } from './token';
import getIllustFollows from './api/get-illust-follows';
import { config } from '@/config';
import pixivUtils from './utils';
import { parseDate } from '@/utils/parse-date';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/user/illustfollows',
    categories: ['social-media'],
    example: '/pixiv/user/illustfollows',
    parameters: {},
    features: {
        requireConfig: [
            {
                name: 'PIXIV_REFRESHTOKEN',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['www.pixiv.net/bookmark_new_illust.php'],
        },
    ],
    name: 'Following timeline',
    maintainers: ['ClarkeCheng'],
    handler,
    url: 'www.pixiv.net/bookmark_new_illust.php',
    description: `::: warning
  Only for self-hosted
:::`,
};

async function handler() {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw new ConfigNotFoundError('pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const token = await getToken(cache.tryGet);
    if (!token) {
        throw new ConfigNotFoundError('pixiv not login');
    }

    const response = await getIllustFollows(token);
    const illusts = response.data.illusts;
    return {
        title: `Pixiv关注的新作品`,
        link: 'https://www.pixiv.net/bookmark_new_illust.php',
        description: `Pixiv关注的画师们的最新作品`,
        item: illusts.map((illust) => {
            const images = pixivUtils.getImgs(illust);
            return {
                title: illust.title,
                author: illust.user.name,
                pubDate: parseDate(illust.create_date),
                description: `${illust.caption}<br><p>画师：${illust.user.name} - 阅览数：${illust.total_view} - 收藏数：${illust.total_bookmarks}</p>${images.join('')}`,
                link: `https://www.pixiv.net/artworks/${illust.id}`,
                category: illust.tags.map((tag) => tag.name),
            };
        }),
    };
}
