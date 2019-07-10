const getToken = require('./token');
const getIllusts = require('./api/getIllusts');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    if (!getToken()) {
        throw 'pixiv not login';
    }

    const response = await getIllusts(id, getToken());

    const illusts = response.data.illusts;
    const username = illusts[0].user.name;

    ctx.state.data = {
        title: `${username} 的 pixiv 动态`,
        link: `https://www.pixiv.net/member.php?id=${id}`,
        description: `${username} 的 pixiv 最新动态`,
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
                title: illust.title,
                author: username,
                pubDate: new Date(illust.create_date).toUTCString(),
                description: `<p>画师：${username} - 阅览数：${illust.total_view} - 收藏数：${illust.total_bookmarks}</p>${images.join('')}`,
                link: `https://www.pixiv.net/member_illust.php?mode=medium&illust_id=${illust.id}`,
            };
        }),
    };
};
