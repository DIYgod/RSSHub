const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
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
            const title = $(item).find('.post-title').text();
            const author = $(item).find('.post-meta > a > strong').text();
            const pubDate = (() => {
                const todoText = $(item).find('.post-meta').text();
                return timezone(new Date(todoText.substr(todoText.indexOf('·') + 1, 10)), +8);
            })();
            const link = base_url + $(item).find('.post-title').attr('href');
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
            return {
                title,
                link,
                author,
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
