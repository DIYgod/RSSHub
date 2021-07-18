const getToken = require('./token');
const searchPopularIllust = require('./api/searchPopularIllust');
const searchIllust = require('./api/searchIllust');
const config = require('@/config').value;

module.exports = async (ctx) => {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw 'pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#%E9%83%A8%E5%88%86-rss-%E6%A8%A1%E5%9D%97%E9%85%8D%E7%BD%AE">relevant config</a>';
    }

    const keyword = ctx.params.keyword;
    const order = ctx.params.order || 'date';
    const mode = ctx.params.mode;

    if (!getToken()) {
        throw 'pixiv not login';
    }

    let response;
    if (order === 'popular') {
        response = await searchPopularIllust(keyword, getToken());
    } else {
        response = await searchIllust(keyword, getToken());
    }

    let illusts = response.data.illusts;
    if (mode === 'safe' || mode === '1') {
        illusts = illusts.filter((item) => item.x_restrict === 0);
    } else if (mode === 'r18' || mode === '2') {
        illusts = illusts.filter((item) => item.x_restrict === 1);
    }

    ctx.state.data = {
        title: `${keyword} 的 pixiv ${order === 'popular' ? '热门' : ''}内容`,
        link: `https://www.pixiv.net/tags/${keyword}/artworks`,
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
                author: illust.user.name,
                pubDate: new Date(illust.create_date).toUTCString(),
                description: `<p>画师：${illust.user.name} - 阅览数：${illust.total_view} - 收藏数：${illust.total_bookmarks}</p>${images.join('')}`,
                link: `https://www.pixiv.net/artworks/${illust.id}`,
            };
        }),
        allowEmpty: true,
    };
};
