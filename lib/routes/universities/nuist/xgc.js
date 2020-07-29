const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const baseTitle = '南信大学生工作处';
const baseUrl = 'http://xgc.nuist.edu.cn';

module.exports = async (ctx) => {
    const link = baseUrl + '/419/list.htm';

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.Article_Title a')
        .slice(0, 6)
        .map((index, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: url.resolve(baseUrl, item.attr('href')),
            };
        })
        .get();

    const items = await Promise.all(
        [...list].map(async (item) => {
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return JSON.parse(cache);
            }

            const response = await got.get(item.link);
            const $ = cheerio.load(response.data);
            const articleInfo = $('.arti_metas');
            item.author = articleInfo.find('.arti_publisher').text().replace('作者：', '');
            item.pubDate = new Date(articleInfo.find('.arti_update').text().match(/\d+/g)).toUTCString();
            item.description = $('.wp_articlecontent ').html();

            ctx.cache.set(item.link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: baseTitle,
        link: link,
        item: items.filter((x) => x),
    };
};
