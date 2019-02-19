const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const host = 'https://leetcode.com';

module.exports = async (ctx) => {
    const link = 'https://leetcode.com/articles/';
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);

    const list = $('a.list-group-item')
        .slice(0, 10)
        .map(function() {
            const info = {
                title: $(this)
                    .find('h4.media-heading')
                    .text(),
                link: $(this).attr('href'),
                date: $(this)
                    .find('p.pull-right.media-date strong')
                    .text(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const date = info.date;
            const itemUrl = url.resolve(host, info.link);

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await axios.get(itemUrl);
            const $ = cheerio.load(response.data);
            const description =
                $('#question-preview')
                    .html()
                    .trim() +
                $('.article-body')
                    .html()
                    .trim();

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: new Date(date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: 'leetcode文章',
        link: link,
        item: out,
    };
};
