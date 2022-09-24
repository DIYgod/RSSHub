const { getToken } = require('./token');
const getBookmarks = require('./api/getBookmarks');
const getUserDetail = require('./api/getUserDetail');
const config = require('@/config').value;
const pixivUtils = require('./utils');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw 'pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>';
    }

    const id = ctx.params.id;

    const token = await getToken(ctx.cache.tryGet);
    if (!token) {
        throw 'pixiv not login';
    }

    const [bookmarksResponse, userDetailResponse] = await Promise.all([getBookmarks(id, token), getUserDetail(id, token)]);

    const illusts = bookmarksResponse.data.illusts;
    const username = userDetailResponse.data.user.name;

    ctx.state.data = {
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
};
