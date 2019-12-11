const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

async function load(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const shotMedia = $('.media-shot').html();
    const shotDescription = $('.shot-desc').html();

    const description = `${shotMedia}<br />
	                        ${shotDescription}<br />
	                        ${$('.shot-views').text()}<br />
	                        ${$('.shot-likes').text()}<br />
	                        ${$('.shot-saves').text()}`;

    return { description };
}

const ProcessFeed = async (list, caches) => {
    const host = 'https://dribbble.com';

    return await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const itemUrlPath =
                $('.animated-target').attr('href') ||
                $('.extras > a')
                    .attr('href')
                    .replace('/rebounds', '');
            const itemUrl = url.resolve(host, itemUrlPath);

            const single = {
                title: $('.dribbble-over strong').text(),
                link: itemUrl,
                author: ($('.attribution-team').text() ? $('.attribution-team').text() + ' -' : '') + $('.attribution-user').text(),
                guid: itemUrl,
                pubDate: new Date($('.timestamp').text()).toUTCString(),
            };

            const other = await caches.tryGet(itemUrl, async () => await load(itemUrl));

            return Promise.resolve(Object.assign({}, single, other));
        })
    );
};

module.exports = {
    ProcessFeed,
};
