const { getToken } = require('./token');
const getIllustFollows = require('./api/getIllustFollows');
const config = require('@/config').value;
const pixivUtils = require('./utils');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw 'pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>';
    }

    const token = await getToken(ctx.cache.tryGet);
    if (!token) {
        throw 'pixiv not login';
    }

    const response = await getIllustFollows(token);
    const illusts = response.data.illusts;
    ctx.state.data = {
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
    };
};
