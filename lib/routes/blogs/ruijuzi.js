const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const base_url = `http://rui.juzi.bot`;
    const response = await got({
        method: 'get',
        url: base_url,
        responseType: 'buffer',
    });
    const data = iconv.decode(response.data, 'utf-8');
    const $ = cheerio.load(data);
    // 此文件主要参考代码: /lib/routes/blogs/jianning.js
    const out = $('article.post')
        .map(async (i, item) => {
            const link = base_url + $(item).find('.post-title').attr('href');
            // 请求每一篇文章链接，取出内容作为description
            const description = await ctx.cache.tryGet(link, async () => {
                const result = await got({
                    method: 'get',
                    url: link,
                    responseType: 'buffer',
                });
                const content = cheerio.load(iconv.decode(result.data, 'utf-8'));
                const prefixContent = $(item).find('.post-desc').text() + '<hr/>';
                return prefixContent + content('article.post').html();
            });
            const pubDate = (() => {
                const todoText = $(item).find('.post-meta').text();
                return new Date(todoText.substr(todoText.indexOf('·') + 1, 10)).getTime();
            })();
            return {
                title: $(item).find('.post-title').text(),
                link,
                author: $(item).find('.post-meta > a > strong').text(),
                pubDate,
                description,
            };
        })
        .get();
    ctx.state.data = {
        title: $('head > title').text(),
        link: base_url,
        item: await Promise.all(out),
    };
};
