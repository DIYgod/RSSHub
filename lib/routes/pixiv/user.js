const getToken = require('./token');
const getIllusts = require('./api/getIllusts');
const config = require('@/config').value;

module.exports = async (ctx) => {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw 'pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#%E9%83%A8%E5%88%86-rss-%E6%A8%A1%E5%9D%97%E9%85%8D%E7%BD%AE">relevant config</a>';
    }

    const id = ctx.params.id;

    if (!getToken()) {
        throw 'pixiv not login';
    }

    const response = await getIllusts(id, getToken());

    const illusts = response.data.illusts;
    const username = illusts[0].user.name;

    ctx.state.data = {
        title: `${username} 的 pixiv 动态`,
        link: `https://www.pixiv.net/users/${id}`,
        description: `${username} 的 pixiv 最新动态`,
        item: illusts.map((illust) => {
            const images = [];
            if (illust.page_count === 1) {
                images.push(`<p><img src="https://pixiv.cat/${illust.id}.jpg"/></p>`);
            } else {
                for (let i = 0; i < illust.page_count; i++) {
                    images.push(`<p><img src="https://pixiv.cat/${illust.id}-${i + 1}.jpg"/></p>`);
                }
            }
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
