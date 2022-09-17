const got = require('@/utils/got');
const cheerio = require('cheerio');

const util = require('./utils');

module.exports = async (ctx) => {
    const { column = '' } = ctx.params;

    let host = `http://www.donews.com/${column}`;

    if (column !== '' && column !== 'idonews') {
        host += '/index';
    }

    const response = await got.get(host);

    const $ = cheerio.load(response.data);

    let list,
        title = 'DoNews - ';

    if (column === '') {
        title += '首页';
    } else {
        title += $('.breadCrumb > a:nth-child(2)').text();
    }

    switch (column) {
        case '':
            // 首页轮播
            list = $('a.news-item').get();

            break;
        case 'ent':
        case 'idonews':
            // 首页轮播
            list = $('ul.zl-top > li > a').get();
            list = list.concat($('.fl.w840 > .block > dl > dd > h3 > a').slice(0, 5).get());

            break;
        default:
            list = $('.fl.w840 > .block > dl > dd > h3 > a').slice(0, 10).get();
            break;
    }

    const items = await Promise.all(
        list.map((e) => {
            const link = $(e).attr('href');
            return ctx.cache.tryGet(link, () => util.ProcessFeed(link));
        })
    );

    ctx.state.data = {
        title,
        link: host,
        description: '中国最早的web2.0网站，专业科技媒体、互联网行业门户网站。提供互联网新闻IT资讯，关注科技创新，覆盖移动互联网创业、游戏、风险投资等热点，是中国互联网行业的风向标。',
        item: items,
    };
};
