const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://github.com';

module.exports = async (ctx) => {
    const { user, repo, page } = ctx.params;

    const url = `${baseUrl}/${user}/${repo}/wiki${page ? `/${page}` : ''}/_history`;

    const { data } = await got(url);
    const $ = cheerio.load(data);

    const items = $('.js-wiki-history-revision')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.h5').text(),
                author: item.find('.mt-1 a').text(),
                pubDate: parseDate(item.find('relative-time').attr('datetime')),
                link: `${baseUrl}${item.find('.text-mono a').attr('href')}`,
            };
        });

    ctx.state.data = {
        title: `${$('.gh-header-title').text()} - ${user}/${repo}`,
        link: url,
        item: items,
    };
};
