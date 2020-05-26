const got = require('@/utils/got');
const cheerio = require('cheerio');
const dateParser = require('@/utils/dateParser');

const base = 'https://institute.jpmorganchase.com';
const url = `${base}/institute/research`;

const parseDetails = async (link, ctx) => {
    const fullLink = `${base}${link}`;
    return ctx.cache.tryGet(fullLink, async () => {
        const response = await got({
            url: fullLink,
        });
        const $ = cheerio.load(response.data);
        const authors = [];
        $('.author-name').each((i, elem) => {
            authors.push($(elem).text());
        });

        return {
            category: $('.eyebrow').text(),
            author: authors.filter((e) => e).join(', '),
            title: $('title').text() + ' | ' + $('.copy-wrap p').text(),
            description: $('.jpmc-wrapper').html(),
            link: fullLink,
            pubDate: dateParser($('.date-field').text(), 'MMMM YYYY'),
        };
    });
};

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url,
    });

    const title = 'All Reports';
    const $ = cheerio.load(response.data);

    const items = $('.item a')
        .map(async (i, item) => {
            const link = item.attribs.href;
            return parseDetails(link, ctx);
        })
        .get();
    ctx.state.data = {
        title: `${title} - JPMorgan Chase Institute`,
        link: url,
        description: `${title} - JPMorgan Chase Institute`,
        item: await Promise.all(items),
    };
};
