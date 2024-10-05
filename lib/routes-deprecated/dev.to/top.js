const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const period = ctx.params.period;
    const link = `https://dev.to/top/${period}`;

    const getHTML = async () => {
        const response = await got({
            method: 'get',
            url: link,
        });

        return response.data;
    };

    const html = await ctx.cache.tryGet(link, getHTML);
    const posts = [];

    const $ = cheerio.load(html);
    $('div.crayons-story__body').each(function () {
        const post = {
            author: $('.crayons-story__secondary', this).text().trim().replaceAll(/\s\s+/g, ', '),
            title: $('.crayons-story__title a', this).text().trim(),
            link: `https://dev.to${$('.crayons-story__title a', this).attr('href')}`,
            description: $('.crayons-story__tags', this).text().trim().replaceAll(/\s\s+/g, ' '),
            pubDate: new Date($('.time-ago-indicator-initial-placeholder', this).attr('data-seconds') * 1000).toUTCString(),
        };

        posts.push(post);
    });

    ctx.state.data = {
        title: `dev.to top (${period})`,
        link,
        description: 'Top dev.to posts',
        language: 'en-us',
        item: posts,
    };
};
