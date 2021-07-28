const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const url = require('url');
const asyncPool = require('tiny-async-pool');

const firstDay = new Date('2020-01-01');
const baseUrl = 'http://www.biquge.info';
// 获取小说的最新章节列表
module.exports = async (ctx) => {
    const { id, limit = 10 } = ctx.params; // 小说id
    const pageUrl = url.resolve(baseUrl, `/${id}/`);

    const response = await got({
        method: 'get',
        url: pageUrl,
        // responseEncoding: 'gbk', //该配置项在 0.18版本中没有打包进去
        responseType: 'buffer',
    });
    const responseHtml = iconv.decode(response.data, 'utf-8');
    const $ = cheerio.load(responseHtml);
    const title = $('#info > h1').text();
    const description = $('#intro>p').eq(0).text();
    const cover_url = $('#fmimg>img').eq(0).attr('src');
    const nItems = $('dd', '#list>dl').length;
    const list = $('dd', '#list>dl').slice(-parseInt(limit));
    const chapter_item = list
        .find('a')
        .map((i, e) => ({
            title: e.children[0].data,
            link: url.resolve(pageUrl, e.attribs.href),
            pubDate: new Date(firstDay.getTime() + (nItems - parseInt(limit) + i) * 1000 * 60 * 60 * 24),
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

        const responseHtml = iconv.decode(response.data, 'utf-8');
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
        link: pageUrl,
        image: cover_url,
        description: description,
        item: items,
    };
};
