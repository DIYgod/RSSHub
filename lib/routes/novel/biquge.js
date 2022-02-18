const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const asyncPool = require('tiny-async-pool');

const baseUrl = 'http://www.biquge5200.com/';
// 获取小说的最新章节列表
module.exports = async (ctx) => {
    const id = ctx.params.id; // 小说id

    const response = await got({
        method: 'get',
        url: `${baseUrl}${id}/`,
        // responseEncoding: 'gbk', //该配置项在 0.18版本中没有打包进去
        responseType: 'buffer',
    });
    const responseHtml = iconv.decode(response.data, 'GBK');
    const $ = cheerio.load(responseHtml);
    const title = $('#list>dl>dt>b').eq(0).text();
    const description = $('#intro>p').eq(0).text();
    const cover_url = $('#fmimg>img').eq(0).attr('src');
    const list = $('dd', '#list>dl').slice(0, 9);
    const chapter_item = list
        .find('a')
        .map((_, e) => ({
            title: e.children[0].data,
            link: e.attribs.href,
            pubDate: new Date((parseInt(e.attribs.href.split('/').pop().replace('.html', '')) - 15015015) * 10000).toUTCString(),
        }))
        .get();

    const items = await asyncPool(3, chapter_item, async (item) => {
        const cache = await ctx.cache.get(item.link);
        if (cache) {
            return Promise.resolve(JSON.parse(cache));
        }

        const response = await got({
            method: 'get',
            url: item.link,
            responseType: 'buffer',
        });

        const responseHtml = iconv.decode(response.data, 'GBK');
        const $ = cheerio.load(responseHtml);

        const description = $('#content').html();

        const single = {
            title: item.title,
            description,
            link: item.link,
            pubDate: item.pubDate,
        };
        ctx.cache.set(item.link, JSON.stringify(single));
        return Promise.resolve(single);
    });
    ctx.state.data = {
        title: `笔趣阁 ${title}`,
        link: `${baseUrl}${id}/`,
        image: cover_url,
        description,
        item: items,
    };
};
