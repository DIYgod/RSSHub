const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://www.hinatazaka46.com';

module.exports = async (ctx) => {
    const currentUrl = `${rootUrl}/s/official/diary/member/list`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const items = $('div.p-blog-group .p-blog-article')
        .toArray()
        .map((item) => {
            const content = cheerio.load(item);

            return {
                title: content('.c-blog-article__title').text(),
                link: content('.c-button-blog-detail').attr('href'),
                pubDate: parseDate(content('.c-blog-article__date').text()),
                author: content('.c-blog-article__name').text(),
                description: content('.c-blog-article__text').html(),
            };
        });

    ctx.state.data = {
        allowEmpty: true,
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
