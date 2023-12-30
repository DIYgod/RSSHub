const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://ocw.mit.edu/courses/most-visited-courses/';

    const getHTML = async () => {
        const response = await got({
            method: 'get',
            url: link,
        });

        return response.data;
    };

    const html = await ctx.cache.tryGet(link, getHTML);
    const courses = [];

    const $ = cheerio.load(html);
    $('.courseList tbody')
        .children()
        .each(function () {
            const course = {
                title: $('td', this).eq(1).text(),
                link: `https://ocw.mit.edu${$('td a', this).eq(1).attr('href')}`,
                description: $('td', this).eq(2).text(),
            };

            courses.push(course);
        });

    ctx.state.data = {
        title: 'MIT OCW top courses of the month',
        link,
        description: 'Most visited courses based on the site traffic of the previous month',
        language: 'en-us',
        item: courses,
    };
};
