const axios = require('../../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

async function load(host, link) {
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);

    $('img').each((index, elem) => {
        const $elem = $(elem);
        const src = $elem.attr('src');
        if (src && src !== '') {
            $elem.attr('src', url.resolve(host, src));
        }
        $elem.removeAttr('style');
        $elem.removeAttr('alt');
    });
    $('div').each((index, elem) => {
        const $elem = $(elem);
        $elem.replaceWith($elem.html().trim());
    });
    $('span').each((index, elem) => {
        const $elem = $(elem);
        $elem.replaceWith($elem.html().trim());
    });
    $('p').each((index, elem) => {
        const $elem = $(elem);
        $elem.replaceWith($elem.html().trim());
    });
    $('b').each((index, elem) => {
        const $elem = $(elem);
        $elem.replaceWith($elem.html().trim());
    });

    const description = $('.field-item').html();

    return { description };
}

const ProcessFeed = async (host, list, caches) => {
    return await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const itemUrl = url.resolve(
                host,
                $('.views-field-nothing', item)
                    .find('a')
                    .slice(1)
                    .attr('href')
            );
            const category = $('.views-field-field-xxlb', item)
                .text()
                .trim();
            const author = $('.views-field-field-xxly', item)
                .text()
                .trim();

            const single = {
                title: $('.views-field-nothing', item)
                    .text()
                    .trim(),
                link: itemUrl,
                guid: itemUrl,
                pubDate: new Date($('.views-field-created', item).text()).toUTCString(),
                category: category,
                author: author === '' ? category : author,
            };

            const other = await caches.tryGet(itemUrl, async () => await load(host, itemUrl));

            return Promise.resolve(Object.assign({}, single, other));
        })
    );
};

module.exports = {
    ProcessFeed,
};
