const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const baseUrl = 'https://news.google.com';

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const locale = ctx.params.locale;

    const categoryUrls = await ctx.cache.tryGet(`google:news:${locale}`, async () => {
        const { data: front_data } = await got(`${baseUrl}/?${locale}`);

        const $ = cheerio.load(front_data);
        return [
            ...$('a.brSCsc')
                .toArray()
                .slice(3) // skip Home, For you and Following
                .map((item) => {
                    item = $(item);
                    return {
                        category: item.text(),
                        url: new URL(item.attr('href'), baseUrl).href,
                    };
                }),
            ...$('a.aqvwYd') // Home
                .toArray()
                .map((item) => {
                    item = $(item);
                    return {
                        category: item.text(),
                        url: new URL(item.attr('href'), baseUrl).href,
                    };
                }),
        ];
    });
    const categoryUrl = categoryUrls.find((item) => item.category === category).url;

    const { data } = await got(categoryUrl);
    const $ = cheerio.load(data);

    const list = [...$('.UwIKyb'), ...$('.IBr9hb'), ...$('.IFHyqb')]; // 3 rows of news, 3-rows-wide news, single row news

    const items = list.map((item) => {
        item = $(item);
        const title = item.find('h4').text();
        return {
            title,
            description: art(path.join(__dirname, 'templates/news.art'), {
                img: item.find('img.Quavad').attr('src'),
                brief: title,
            }),
            pubDate: parseDate(item.find('time').attr('datetime')),
            author: item.find('.oovtQ').text(),
            link: new URL(item.find('a.WwrzSb').first().attr('href'), baseUrl).href,
        };
    });

    ctx.state.data = {
        title: $('title').text(),
        link: categoryUrl,
        item: items,
    };
};
