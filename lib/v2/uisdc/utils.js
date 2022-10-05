/* eslint-disable array-callback-return */
/* eslint-disable no-undef */
/* eslint-disable no-case-declarations */
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

async function ProcessList(baseUrl, listName) {
    const result = await got(baseUrl, { https: { rejectUnauthorized: false } });
    const $ = cheerio.load(result.data);

    const items = $(listName)
        .toArray()
        .map((item) => {
            item = $(item);
            const href = $(item).find('a').attr('href');

            return {
                link: href,
                title: item.find('a').attr('title'),
            };
        });
    return items;
}

async function ProcessFeed(items, listDate, artiContent, ctx) {
    return await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const result = await got(item.link, { https: { rejectUnauthorized: false } });
                const $ = cheerio.load(result.data);
                item.author = $('.meta-item.meta-author').text() + '  ' + $('.meta-item.meta-zan').text() + '  ' + $('.meta-item.meta-read').text();
                item.pubDate = timezone(parseDate($('.meta-item.meta-time').attr('title'), 'YYYY-MM-DD hh:mm:ss'), +8);
                item.description = $(artiContent).html();
                return item;
            })
        )
    );
}

module.exports = {
    ProcessList,
    ProcessFeed,
};
