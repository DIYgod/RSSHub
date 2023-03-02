const got = require('@/utils/got');
const cheerio = require('cheerio');
const { fetchArticle } = require('@/utils/wechat-mp');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.wxkol.com';
    const { id } = ctx.params;
    const url = `${baseUrl}/show/${id}.html`;

    const { data: response } = await got(url);
    const $ = cheerio.load(response);

    const list = $('.artlist li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('.title a');
            return {
                title: a.attr('title'),
                link: `${baseUrl}${a.attr('href')}`,
            };
        });

    const items = await Promise.all(
        list.map(async (item) => {
            const { data: response } = await got(item.link);
            const $ = cheerio.load(response);
            const link = `${baseUrl}${$('.source a').attr('href')}`;

            const { title, author, description, summary, pubDate, mpName, link: itemLink } = await fetchArticle(ctx, link, true);

            item.title = title;
            item.author = author;
            item.description = description;
            item.summary = summary;
            item.pubDate = pubDate;
            item.author = mpName;
            item.link = itemLink;

            return item;
        })
    );

    ctx.state.data = {
        title: $('head title').text(),
        description: $('head description').text(),
        link: url,
        image: $('.main .logo .avatar')
            .attr('style')
            .match(/url\('(.+)'\)/)[1],
        item: items,
    };
};
