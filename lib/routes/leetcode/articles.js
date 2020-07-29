const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'https://leetcode.com';

module.exports = async (ctx) => {
    const link = 'https://leetcode.com/articles/';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const list = $('a.list-group-item')
        .slice(0, 10)
        .filter((i, e) => $(e).find('h4.media-heading i').length === 0)
        .map(function () {
            const info = {
                title: $(this).find('h4.media-heading').text().trim(),
                author: $(this).find('.text-500').text(),
                link: $(this).attr('href'),
                date: $(this).find('p.pull-right.media-date strong').text().trim(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const itemUrl = url.resolve(host, info.link);

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);

            const description = $('#question-preview').html().trim() + $('.article-body').html().trim();

            const single = {
                title: info.title,
                author: info.author,
                link: itemUrl,
                description,
                pubDate: new Date(info.date).toUTCString(),
            };

            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: 'LeetCode Articles',
        description: 'LeetCode Articles, the only official solutions you will find.',
        link,
        item: out,
    };
};
