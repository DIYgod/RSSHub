const axios = require('@/utils/axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

async function load(link, ctx) {
    const cache = await ctx.cache.get(link);
    if (cache) {
        return cache;
    }
    const response = await axios.get(link, {
        responseType: 'arraybuffer',
    });
    response.data = iconv.decode(response.data, 'gb2312');

    const $ = cheerio.load(response.data);

    const description = $('div#Zoom').html();
    await ctx.cache.set(link, description);
    return description;
}

module.exports = async (ctx) => {
    const response = await axios.get('http://www.dytt8.net', {
        responseType: 'arraybuffer',
    });
    response.data = iconv.decode(response.data, 'gb2312');

    const $ = cheerio.load(response.data);
    const list = $('.co_content8 table tr').get();
    // 页面含有2个.co_content8 table
    // 仅第一个table内第一个tr元素是广告连接
    // 去除该广告连接
    list.splice(0, 1);
    // const list = $('.co_content8 table tr:not(:first-child)').get();
    const process = await Promise.all(
        list.map(async (item) => {
            const link = $(item).find('a:nth-of-type(2)');
            const itemUrl = 'http://www.dytt8.net' + link.attr('href');
            const other = await load(itemUrl, ctx);

            return {
                enclosure_url: String(other.match(/magnet:.*?(?=">)/)),
                enclosure_type: 'application/x-bittorrent',
                title: link.text(),
                description: other,
                pubDate: new Date(
                    $(item)
                        .find('font')
                        .text()
                ).toUTCString(),
                link: itemUrl,
            };
        })
    );

    const data = {
        title: '电影天堂',
        link: 'http://www.dytt8.net',
        description: '电影天堂RSS',
        item: process,
    };

    ctx.state.data = data;
};
