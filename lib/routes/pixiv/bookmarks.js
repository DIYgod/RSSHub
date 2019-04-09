const getToken = require('./token');
const getBookmarks = require('./api/getBookmarks');
const getUserDetail = require('./api/getUserDetail');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    if (!getToken()) {
        throw 'pixiv not login';
    }

    const [bookmarksResponse, userDetailResponse] = await Promise.all([getBookmarks(id, getToken()), getUserDetail(id, getToken())]);

    const illusts = bookmarksResponse.data.illusts;
    const username = userDetailResponse.data.user.name;

    ctx.state.data = {
        title: `${username} 的收藏`,
        link: `https://www.pixiv.net/bookmark.php?id=${id}`,
        description: `${username} 的 pixiv 最新收藏`,
        item: illusts.map((illust) => {
            const images = [];
            if (illust.page_count === 1) {
                images.push(`<p><img referrerpolicy="no-referrer" src="https://pixiv.cat/${illust.id}.jpg"/></p>`);
            } else {
                for (let i = 0; i < illust.page_count; i++) {
                    images.push(`<p><img referrerpolicy="no-referrer" src="https://pixiv.cat/${illust.id}-${i + 1}.jpg"/></p>`);
                }
            }
            return {
                title: `${illust.title}`,
                author: illust.user.name,
                pubDate: new Date(illust.create_date).toUTCString(),
                description: `<p>画师：${illust.user.name} - 阅览数：${illust.total_view} - 收藏数：${illust.total_bookmarks}</p>${images.join('')}`,
                link: `https://www.pixiv.net/member_illust.php?mode=medium&illust_id=${illust.id}`,
            };
        }),
    };
};
