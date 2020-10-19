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
        const post = {};

        const author = $('.crayons-story__secondary', this).text().trim().replace(/\s\s+/g, ', ');
        const title = $('.crayons-story__title a', this).text().trim();
        const link = `https://dev.to${$('.crayons-story__title a', this).attr('href')}`;
        const description = $('.crayons-story__tags', this).text().trim().replace(/\s\s+/g, ' ');
        const pubDate = new Date($('.time-ago-indicator-initial-placeholder', this).attr('data-seconds') * 1000).toUTCString();

        post.author = author;
        post.title = title;
        post.link = link;
        post.description = description;
        post.pubDate = pubDate;

        posts.push(post);
    });

    ctx.state.data = {
        title: `dev.to top (${period})`,
        link,
        description: 'Top dev.to posts',
        language: 'en-us',
        item: posts.map((post) => ({
            title: post.title,
            description: post.description,
            link: post.link,
            author: post.author,
            pubDate: post.pubDate,
        })),
    };
};
