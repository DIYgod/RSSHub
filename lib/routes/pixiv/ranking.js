const getToken = require('./token');
const getRanking = require('./api/getRanking');
const config = require('@/config');

const titles = {
    day: 'pixiv 日排行',
    week: 'pixiv 周排行',
    month: 'pixiv 月排行',
    day_male: 'pixiv 受男性欢迎排行',
    day_female: 'pixiv 受女性欢迎排行',
    week_original: 'pixiv 原创作品排行',
    week_rookie: 'pixiv 新人排行',
    day_r18: 'pixiv R-18 日排行',
    day_male_r18: 'pixiv R-18 受男性欢迎排行',
    day_female_r18: 'pixiv R-18 受女性欢迎排行',
    week_r18: 'pixiv R-18 周排行',
    week_r18g: 'pixiv R-18G 排行',
};

const links = {
    day: 'https://www.pixiv.net/ranking.php?mode=daily',
    week: 'https://www.pixiv.net/ranking.php?mode=weekly',
    month: 'https://www.pixiv.net/ranking.php?mode=monthly',
    day_male: 'https://www.pixiv.net/ranking.php?mode=male',
    day_female: 'https://www.pixiv.net/ranking.php?mode=female',
    week_original: 'https://www.pixiv.net/ranking.php?mode=original',
    week_rookie: 'https://www.pixiv.net/ranking.php?mode=rookie',
    day_r18: 'https://www.pixiv.net/ranking.php?mode=daily_r18',
    day_male_r18: 'https://www.pixiv.net/ranking.php?mode=male_r18',
    day_female_r18: 'https://www.pixiv.net/ranking.php?mode=female_r18',
    week_r18: 'https://www.pixiv.net/ranking.php?mode=weekly_r18',
    week_r18g: 'https://www.pixiv.net/ranking.php?mode=r18g',
};

module.exports = async (ctx) => {
    if (!config.pixiv || !config.pixiv.username || !config.pixiv.password) {
        throw 'pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#%E9%83%A8%E5%88%86-rss-%E6%A8%A1%E5%9D%97%E9%85%8D%E7%BD%AE">relevant config</a>';
    }

    const mode = ctx.params.mode;
    const date = ctx.params.date ? new Date(ctx.params.date) : new Date();

    if (!getToken()) {
        throw 'pixiv not login';
    }

    const response = await getRanking(mode, ctx.params.date && date, getToken());

    const illusts = response.data.illusts;

    const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 `;

    ctx.state.data = {
        title: (ctx.params.date ? dateStr : '') + titles[mode],
        link: links[mode],
        description: dateStr + titles[mode],
        item: illusts.map((illust, index) => {
            const images = [];
            if (illust.page_count === 1) {
                images.push(`<p><img src="https://pixiv.cat/${illust.id}.jpg"/></p>`);
            } else {
                for (let i = 0; i < illust.page_count; i++) {
                    images.push(`<p><img src="https://pixiv.cat/${illust.id}-${i + 1}.jpg"/></p>`);
                }
            }
            return {
                title: `#${index + 1} ${illust.title}`,
                pubDate: new Date(illust.create_date).toUTCString(),
                description: `<p>画师：${illust.user.name} - 阅览数：${illust.total_view} - 收藏数：${illust.total_bookmarks}</p><br>${images.join('')}`,
                link: `https://www.pixiv.net/member_illust.php?mode=medium&illust_id=${illust.id}`,
                author: `${illust.user.name}`,
            };
        }),
    };
};
