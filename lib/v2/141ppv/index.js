const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.141ppv.com';
    const currentUrl = `${rootUrl}${ctx.path}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    if (ctx.path === '/') {
        ctx.redirect(`/141ppv${$('.overview').first().attr('href')}`);
        return;
    }

    const items = $('.columns')
        .toArray()
        .map((item) => {
            item = $(item);

            const id = item.find('.title a').text();
            const size = item.find('.title span').text();
            const pubDate = item.find('.subtitle a').attr('href').split('/date/').pop();
            const description = item.find('.has-text-grey-dark').text();
            const actresses = item
                .find('.panel-block')
                .toArray()
                .map((a) => $(a).text().trim());
            const tags = item
                .find('.tag')
                .toArray()
                .map((t) => $(t).text().trim());
            const magnet = item.find('a[title="Magnet torrent"]').attr('href');
            const link = item.find('a[title="Download .torrent"]').attr('href');
            const image = item.find('.image').attr('src');

            return {
                title: `${id} ${size}`,
                pubDate: parseDate(pubDate, 'YYYY/MM/DD'),
                link: new URL(item.find('a').first().attr('href'), rootUrl).href,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image,
                    id,
                    size,
                    pubDate,
                    description,
                    actresses,
                    tags,
                    magnet,
                    link,
                }),
                author: actresses.join(', '),
                category: [...tags, ...actresses],
                enclosure_type: 'application/x-bittorrent',
                enclosure_url: magnet,
            };
        });

    ctx.state.data = {
        title: `141PPV - ${$('title').text().split('-')[0].trim()}`,
        link: currentUrl,
        item: items,
    };
};
