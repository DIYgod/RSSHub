// @ts-nocheck
import cache from '@/utils/cache';
const { getToken } = require('./token');
const getIllusts = require('./api/get-illusts');
import { config } from '@/config';
const pixivUtils = require('./utils');
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw new Error('pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }

    const id = ctx.req.param('id');
    const token = await getToken(cache.tryGet);
    if (!token) {
        throw new Error('pixiv not login');
    }

    const response = await getIllusts(id, token);

    const illusts = response.data.illusts;
    const username = illusts[0].user.name;

    ctx.set('data', {
        title: `${username} 的 pixiv 动态`,
        link: `https://www.pixiv.net/users/${id}`,
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
    });
};
