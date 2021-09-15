const getToken = require('./token');
const getBookmarks = require('./api/getBookmarks');
const getUserDetail = require('./api/getUserDetail');
const config = require('@/config').value;

module.exports = async (ctx) => {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw 'pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#%E9%83%A8%E5%88%86-rss-%E6%A8%A1%E5%9D%97%E9%85%8D%E7%BD%AE">relevant config</a>';
    }

    const id = ctx.params.id;

    const token = await getToken();
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
            const images = [];
            if (illust.page_count === 1) {
                images.push(`<p><img src='https://pixiv.cat/${illust.id}.jpg'/></p>`);
            } else {
                for (let i = 0; i < illust.page_count; i++) {
                    images.push(`<p><img src='https://pixiv.cat/${illust.id}-${i + 1}.jpg'/></p>`);
                }
            }
            return {
                title: illust.title,
                author: illust.user.name,
                pubDate: new Date(illust.create_date).toUTCString(),
                description: `<p>画师：${illust.user.name} - 阅览数：${illust.total_view} - 收藏数：${illust.total_bookmarks}</p>${images.join('')}`,
                link: `https://www.pixiv.net/artworks/${illust.id}`,
            };
        }),
    };
};
