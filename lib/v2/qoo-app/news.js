const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const { newsUrl, siteIcon, fixImg } = require('./utils');

module.exports = async (ctx) => {
    const { lang = '' } = ctx.params;
    const apiUrl = `${newsUrl}${lang ? `/${lang}` : ''}/wp-json/wp/v2/posts`;

    const { data } = await got(apiUrl, {
        searchParams: {
            per_page: ctx.query.limit ? parseInt(ctx.query.limit) : 100,
        },
    });

    const items = data.map((item) => {
        const $ = cheerio.load(item.content.rendered, null, false);

        fixImg($);

        return {
            title: item.title.rendered,
            link: item.link.substring(0, item.link.lastIndexOf('/')),
            description: $.html(),
            pubDate: parseDate(item.date_gmt),
        };
    });

    ctx.state.data = {
        title: 'QooApp : Anime Game Platform',
        description:
            lang !== 'en'
                ? 'QooApp 是專注二次元的專業平台，旨在聚集世界各地熱愛ACG的用戶，為他們創造有價值的服務和產品。從遊戲商店、新聞資訊、玩家社群，到線下聚會、漫畫閱讀、遊戲發行——QooApp不斷進化中，拓展突破次元的遊玩體驗。'
                : 'QooApp is a professional platform specialising in Anime, Comics and Games (ACG) culture. We aim to unite ACG fans around the globe and help them as thoroughly as we can.',
        image: siteIcon,
        link: `${newsUrl}${lang ? `/${lang}` : ''}`,
        language: lang !== 'en' ? 'zh' : 'en',
        item: items,
    };
};
