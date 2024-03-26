import { Route } from '@/types';
import cache from '@/utils/cache';
import { getToken } from './token';
import getBookmarks from './api/get-bookmarks';
import getUserDetail from './api/get-user-detail';
import { config } from '@/config';
import pixivUtils from './utils';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/user/bookmarks/:id',
    categories: ['social-media'],
    example: '/pixiv/user/bookmarks/15288095',
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
            source: ['www.pixiv.net/users/:id/bookmarks/artworks'],
        },
    ],
    name: 'User Bookmark',
    maintainers: ['EYHN'],
    handler,
};

async function handler(ctx) {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw new Error('pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }

    const id = ctx.req.param('id');

    const token = await getToken(cache.tryGet);
    if (!token) {
        throw new Error('pixiv not login');
    }

    const [bookmarksResponse, userDetailResponse] = await Promise.all([getBookmarks(id, token), getUserDetail(id, token)]);

    const illusts = bookmarksResponse.data.illusts;
    const username = userDetailResponse.data.user.name;

    return {
        title: `${username} 的收藏`,
        link: `https://www.pixiv.net/users/${id}/bookmarks/artworks`,
        description: `${username} 的 pixiv 最新收藏`,
        item: illusts.map((illust) => {
            const images = pixivUtils.getImgs(illust);
            return {
                title: illust.title,
                author: illust.user.name,
                pubDate: parseDate(illust.create_date),
                description: `<p>画师：${illust.user.name} - 阅览数：${illust.total_view} - 收藏数：${illust.total_bookmarks}</p>${images.join('')}`,
                link: `https://www.pixiv.net/artworks/${illust.id}`,
            };
        }),
    };
}
