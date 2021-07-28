const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const link = 'https://www.dwnews.com/';
    const api = 'https://prod-site-api.dwnews.com/v2/articles';
    const response = await got.get(link);

    const $ = cheerio.load(response.data, { xmlMode: true });
    const list = JSON.parse($('#__NEXT_DATA__')[0].children[0].data).props.pageProps.initialState.home.page.sections.find((s) => s.name === '新闻排行榜 24h').items;

    const out = await Promise.all(
        list.map(async (item) => {
            const url = `${api}/${item.id}`;
            const cache = await ctx.cache.get(url);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response = await got.get(url);

            const single = utils.ProcessFeed(response.data);

            ctx.cache.set(url, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    if (ctx.params.type || ctx.params.range) {
        out.push({
            title: '由于源站改版，该源地址及参数已更新，请参考文档。',
            pubDate: new Date(),
        });
    }

    ctx.state.data = {
        title: `多维新闻网 - 24 小时新闻排行榜`,
        description: '多维新闻网—记住世界的轨迹 更需多维的视线，海外华人首选的中文门户新闻网站，及时全面的向全球海外华人更新世界各地时事政治、经济、科技、人文历史、图片、视频等新闻内容，是海外华人必上的新闻门户网站。',
        link: 'http://www.dwnews.com/',
        item: out,
    };
};
