const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

/* TODO load
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

    const description = $('div#endText').html();
    await ctx.cache.set(link, description, 24 * 60 * 60);
    return description;
}
*/

module.exports = async (ctx) => {
    const response = await axios.get('http://www.hao6v.com/gvod/zx.html', {
        responseType: 'arraybuffer',
    });
    response.data = iconv.decode(response.data, 'gb2312');

    const $ = cheerio.load(response.data);
    const list = $('div#main .list li a font').get();

    const process = await Promise.all(
        list.map(async (item) => {
            const linkUrl = item.parent.attribs.href;
            const titleText = item.children[0].data;

            // const other = await load(linkUrl, ctx);

            return {
                // enclosure_url: String(other.match(/magnet:.*?(?=">)/)),
                // enclosure_type: 'application/x-bittorrent',
                title: titleText,
                // description: other,
                link: linkUrl,
            };
        })
    );

    const data = {
        title: '6vhao电影飘红推荐',
        link: 'http://www.hao6v.com',
        description: '6vhao电影RSS',
        item: process,
    };
    ctx.state.data = data;
};
