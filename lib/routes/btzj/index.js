const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const baseURL = 'https://www.88btbtt.com/';
async function load(link, ctx) {
    const cache = await ctx.cache.get(link);
    if (cache) {
        return JSON.parse(cache);
    }
    const response = await got({
        method: 'get',
        url: link,
        responseType: 'buffer',
    });
    const responseHtml = iconv.decode(response.data, 'GBK');
    const $ = cheerio.load(responseHtml);

    const other = {};
    const ela$ = $('#body > div > table:nth-child(2) > tbody > tr:nth-child(1) > td.post_td > div.attachlist > table > tbody > tr:nth-child(3) > td:nth-child(1) > a');
    other.des = 'torrent下载链接:\n' + baseURL + ela$.attr('href').replace('dialog', 'download');
    other.pubDate = new Date($('.bg2.border b:nth-child(2)').html()).toUTCString();
    ctx.cache.set(link, JSON.stringify(other));
    return other;
}

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: baseURL,
    });
    const htmldata = response.data;
    const $ = cheerio.load(htmldata);
    const list = $('.subject_link.thread-new');

    const base_item = list
        .map((_, e) => ({
            title: e.attribs.title,
            link: baseURL + e.attribs.href,
        }))
        .get()
        .slice(0, 8)
        .reverse();

    const items = await Promise.all(
        base_item.map(async (item) => {
            const other = await load(item.link, ctx);
            // eslint-disable-next-line no-console
            console.log(other);

            return {
                title: item.title,
                description: other.des,
                pubDate: other.pubDate,
                link: item.link,
            };
        })
    );

    const data = {
        title: 'BT之家',
        link: baseURL,
        description: 'BT之家RSS',
        item: items,
    };

    ctx.state.data = data;
};
