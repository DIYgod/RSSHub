const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const link = `https://github.com/topics/${ctx.params.name}`;
    const { data, url } = await got(link, {
        searchParams: new URLSearchParams(ctx.params.qs),
    });
    const $ = cheerio.load(data);

    ctx.state.data = {
        title: $('title').text(),
        description: $('.markdown-body').text().trim(),
        link: url,
        item: $('article.my-4')
            .toArray()
            .map((item) => {
                item = $(item);

                const title = item.find('h3').text().trim();
                const author = title.split('/')[0];
                const description = (item.find('a img').prop('outerHTML') ?? '') + item.find('div > div > p').text();
                const link = `https://github.com${item.find('h3 a').last().attr('href')}`;
                const category = item
                    .find('.topic-tag')
                    .toArray()
                    .map((item) => $(item).text().trim());
                const pubDate = parseDate(item.find('relative-time').attr('datetime'));

                return {
                    title,
                    author,
                    description,
                    link,
                    category,
                    pubDate,
                };
            }),
    };
};
