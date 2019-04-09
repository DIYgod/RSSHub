const getToken = require('./token');
const searchPopularIllust = require('./api/searchPopularIllust');
const searchIllust = require('./api/searchIllust');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;
    const order = ctx.params.order || 'date';

    if (!getToken()) {
        throw 'pixiv not login';
    }

    let response;
    if (order === 'popular') {
        response = await searchPopularIllust(keyword, getToken());
    } else {
        response = await searchIllust(keyword, getToken());
    }

    const illusts = response.data.illusts;
    const username = illusts[0].user.name;

    ctx.state.data = {
        title: `${keyword} 的 pixiv ${order === 'popular' ? '热门' : ''}内容`,
        link: `https://www.pixiv.net/search.php?word=${keyword}`,
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
                description: `<p>画师：${illust.user.name} - 阅览数：${illust.total_view} - 收藏数：${illust.total_bookmarks}</p>${images.join('')}`,
                link: `https://www.pixiv.net/member_illust.php?mode=medium&illust_id=${illust.id}`,
            };
        }),
    };
};
