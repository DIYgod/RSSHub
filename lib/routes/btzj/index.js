const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const maps = {
    base: 'https://www.88btbtt.com/',
    govern: 'http://www.1btjia.com/',
};
// const baseSuffix = 'forum-index-fid-951.htm';
async function load(link, type, ctx) {
    const cache = await ctx.cache.get(link);
    if (cache) {
        return JSON.parse(cache);
    }
    const response = await got({
        method: 'get',
        url: link,
        responseType: 'buffer',
    });
    const responseHtml = iconv.decode(response.data, 'utf-8');
    const $ = cheerio.load(responseHtml);

    const other = {};
    const ela$ = $('#body > div > table:nth-child(2) > tbody > tr:nth-child(1) > td.post_td > div.attachlist > table > tbody > tr:nth-child(3) > td:nth-child(1) > a');
    const ela$1 = $('#body > div > table:nth-child(2) > tbody > tr:nth-child(1) > td.post_td > div > div.attachlist > table > tbody > tr:nth-child(3) > td:nth-child(1) > a');
    const content$ = $('.bg1.border.post');
    const downloadPrefix = type === 'base' ? 'torrent下载链接:<br/><br/>' + maps[type] : 'torrent下载链接:<br/><br/>';
    const downloada = type === 'base' ? ela$.attr('href') : ela$1.attr('href');
    const downloadURL = downloada === undefined ? '无下载链接' : downloada.replace('dialog', 'download').toString();
    const content = content$.html().toString();
    other.des = downloadPrefix + downloadURL + '<br/><br/>' + '内容简介:<br/>' + content;
    other.pubDate = type === 'base' ? new Date($('.bg2.border b:nth-child(2)').html()).toUTCString() : new Date().toUTCString();
    ctx.cache.set(link, JSON.stringify(other));
    return other;
}

module.exports = async (ctx) => {
    const type = ctx.params.type || 'base';
    const response = await got({
        method: 'get',
        url: maps[type],
    });
    const htmldata = response.data;
    const $ = cheerio.load(htmldata);
    const list = $('.subject_link.thread-new').slice(0, 10);

    const base_item = list
        .map((_, e) => ({
            title: type === 'base' ? e.attribs.title : $(e).html(),
            link: type === 'base' ? maps[type] + e.attribs.href : e.attribs.href,
        }))
        .get()
        .reverse();

    const items = await Promise.all(
        base_item.map(async (item) => {
            const other = await load(item.link, type, ctx);
            return {
                enclosure_url: String(item.link),
                enclosure_type: 'application/x-bittorrent',
                title: item.title,
                description: other.des,
                pubDate: other.pubDate,
                link: item.link,
            };
        })
    );

    const data = {
        title: 'BT之家',
        link: maps[type],
        description: 'BT之家RSS',
        item: items,
    };

    ctx.state.data = data;
};
