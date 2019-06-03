const axios = require('@/utils/axios');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const response = await axios.get('http://www.dwnews.com/html/share/24-7topnews.js');

    const data = JSON.parse(response.data.replace('var rankingData = ', ''));

    let list, title;
    switch (ctx.params.type) {
        case 'news':
            if (ctx.params.range === '1') {
                list = data.newsRanklist['24H'];
                title = '新闻 24 小时排行';
            } else {
                list = data.newsRanklist['7D'];
                title = '新闻 7 日排行';
            }
            break;
        case 'photo':
            if (ctx.params.range === '1') {
                list = data.photoRanklist['24H'];
                title = '图集 24 小时排行';
            } else {
                list = data.photoRanklist['7D'];
                title = '图集 7 日排行';
            }

            break;
        default:
            break;
    }

    const out = await Promise.all(
        list.slice(0, 10).map(async (item) => {
            const cache = await ctx.cache.get(item.url);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response = await axios.get(item.url.replace('.html', '_all.html'));
            const $ = cheerio.load(response.data);

            const result = utils.ProcessRank($, ctx.params.type);

            const single = {
                title: item.title,
                link: item.url,
                author: result.author,
                description: result.description,
                pubDate: result.pubDate,
            };
            ctx.cache.set(item.url, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `多维新闻网 - ${title}`,
        description: '多维新闻网—记住世界的轨迹 更需多维的视线，海外华人首选的中文门户新闻网站，及时全面的向全球海外华人更新世界各地时事政治、经济、科技、人文历史、图片、视频等新闻内容，是海外华人必上的新闻门户网站。',
        link: 'http://www.dwnews.com/',
        item: out,
    };
};
