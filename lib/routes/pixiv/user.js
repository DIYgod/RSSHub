const getToken = require('./token');
const getIllusts = require('./api/getIllusts');
const config = require('@/config').value;
const pixivUtils = require('./utils');

module.exports = async (ctx) => {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw 'pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>';
    }

    const id = ctx.params.id;
    const token = await getToken();
    if (!token) {
        throw 'pixiv not login';
    }

    const response = await getIllusts(id, token);

    const illusts = response.data.illusts;
    const username = illusts[0].user.name;

    ctx.state.data = {
        title: `${username} 的 pixiv 动态`,
        link: `https://www.pixiv.net/users/${id}`,
        description: `${username} 的 pixiv 最新动态`,
        item: illusts.map((illust) => {
            const images = pixivUtils.getImgs(illust);
            return {
                title: illust.title,
                author: username,
                pubDate: new Date(illust.create_date).toUTCString(),
                description: `<p>画师：${username} - 阅览数：${illust.total_view} - 收藏数：${illust.total_bookmarks}</p>${images.join('')}`,
                link: `https://www.pixiv.net/artworks/${illust.id}`,
            };
        }),
    };
};
