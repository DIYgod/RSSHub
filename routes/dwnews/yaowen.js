const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const link = 'http://news.dwnews.com';
    let region,
        host,
        title = '要闻';

    if (ctx.params.region) {
        region = ctx.params.region.toLowerCase();
        switch (region) {
            case 'china':
                title = `中国${title}`;
                break;
            case 'global':
                title = `国际${title}`;
                break;
            case 'hongkong':
                title = `香港${title}`;
                break;
            case 'taiwan':
                title = `台湾${title}`;
                break;
            default:
                break;
        }
        host = `${link}/html/news/${region}/list0.json`;
    } else {
        region = 'yaowen';
        host = `${link}/html/news/yaowen/list0.json`;
    }

    const list = await axios.get(host);

    const out = await Promise.all(
        list.data.slice(0, 10).map(async (item) => {
            const cache = await ctx.cache.get(item.url);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response = await axios.get(item.url.replace('.html', '_all.html'));
            const $ = cheerio.load(response.data);

            const pubDate = new Date(item.showTime);
            pubDate.setHours(pubDate.getHours() - 8);

            const description = utils.ProcessFeed($, item);

            const single = {
                title: item.title,
                link: item.url,
                author: $('div.nw').text(),
                description,
                pubDate: pubDate.toUTCString(),
            };
            ctx.cache.set(item.url, JSON.stringify(single), 2 * 60 * 60);
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `多维新闻网 - ${title}`,
        description: '多维新闻网—记住世界的轨迹 更需多维的视线，海外华人首选的中文门户新闻网站，及时全面的向全球海外华人更新世界各地时事政治、经济、科技、人文历史、图片、视频等新闻内容，是海外华人必上的新闻门户网站。',
        link: `${region === 'yaowen' ? link : link + '/' + region}`,
        item: out,
    };
};
