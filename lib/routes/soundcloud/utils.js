const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

async function load(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data, { xmlMode: true });
    let result = '';
    const tmp = $('noscript article p');
    result += `<p>${tmp.html()}</p>`;
    const embed_url = $('noscript article div').first().children().first().attr('content');
    result += `<iframe width=85% src=${embed_url}/>`;
    return { description: result };
}

const ProcessFeed = async (list, caches) => {
    const host = 'https://www.soundcloud.com';

    return await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $('h2').children().first();

            const itemUrl = url.resolve(host, $title.attr('href'));

            const author = $('h2').children().last().text();

            const date = new Date($('time').text());
            const timeZone = 8;
            const serverOffset = date.getTimezoneOffset() / 60;
            const pubDate = new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset)).toUTCString();
            const single = {
                title: $title.text(),
                link: itemUrl,
                guid: itemUrl,
                author,
                pubDate,
            };
            const other = await caches.tryGet(itemUrl, async () => await load(itemUrl));
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
};
module.exports = {
    ProcessFeed,
};
