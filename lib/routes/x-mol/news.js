const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const tag = ctx.params.tag;
    const path = tag ? `news/tag/${tag}` : 'news/index';
    const response = await got(path, {
        method: 'GET',
        prefixUrl: utils.host,
    });
    const data = response.data;
    const $ = cheerio.load(data);

    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content');
    const newsitem = $('.newsitem');

    const item = newsitem
        .map((index, element) => {
            const title = $(element).find('h3').find('a').text();
            const a = $(element).find('p').find('a');
            const link = utils.host + a.attr('href');
            const image = $(element).find('img').attr('src');
            const description = utils.setDesc(image, a.text());
            const span = $(element).find('.space-right-m30');
            const author = span.text().replace('来源：', '').trim();
            const date = utils.getDate(span.next().text());
            const pubDate = utils.transDate(date);

            const single = {
                title: title,
                link: link,
                description: description,
                author: author,
                pubDate: pubDate,
            };
            return single;
        })
        .get();

    ctx.state.data = {
        title: title,
        link: response.url,
        description: description,
        item: item,
    };
};
