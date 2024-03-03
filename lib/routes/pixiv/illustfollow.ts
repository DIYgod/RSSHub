// @ts-nocheck
import cache from '@/utils/cache';
const { getToken } = require('./token');
const getIllustFollows = require('./api/get-illust-follows');
import { config } from '@/config';
const pixivUtils = require('./utils');
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw new Error('pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }

    const token = await getToken(cache.tryGet);
    if (!token) {
        throw new Error('pixiv not login');
    }

    const response = await getIllustFollows(token);
    const illusts = response.data.illusts;
    ctx.set('data', {
        title: `Pixiv关注的新作品`,
        link: 'https://www.pixiv.net/bookmark_new_illust.php',
        description: `Pixiv关注的画师们的最新作品`,
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
    });
};
