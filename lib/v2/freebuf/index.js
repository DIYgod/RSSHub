const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { type = 'web' } = ctx.params;

    const rootUrl = 'https://www.freebuf.com';
    const currentUrl = `${rootUrl}/articles/${type}`;

    const options = {
        headers: {
            referer: currentUrl,
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        },
    };

    const response = await got.get(currentUrl, options);

    const $ = cheerio.load(response.data);

    const items = $('div.article-item')
        .toArray()
        .map((item) => {
            item = $(item);
            const left = item.find('.title-left');
            const content = item.find('.item-right');
            return {
                title: left.find('span[class="title text-line-1"]').text(),
                link: `${rootUrl}${left.find('span[class="title text-line-1"]').parent().attr('href')}`,
                description: content.find('a[class="text text-line-2"]').text(),
                pubDate: parseDate(content.find('.item-bottom').find('p.bottom-right').children('span').last().text()),
                author: content.find('.item-bottom').children('p').first().find('span').text(),
            };
        });

    ctx.state.data = {
        title: `Freebuf ${type}`,
        link: currentUrl,
        item: items,
    };
};
