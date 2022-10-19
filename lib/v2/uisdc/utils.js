const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const pageType = (href) => {
    if (href.includes('hunter')) {
        return 'hunter';
    } else {
        return 'index';
    }
};

async function ProcessList(baseUrl, listName) {
    const result = await got(baseUrl, { https: { rejectUnauthorized: false } });
    const $ = cheerio.load(result.data);

    const items = $(listName)
        .toArray()
        .map((item) => {
            const href = $(item).find('a').attr('href');
            const type = pageType(href);

            return {
                link: href,
                title: $(item).find('a').attr('title'),
                type,
            };
        });
    return items;
}

async function ProcessFeed(items, _listDate, artiContent, ctx) {
    return await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                // eslint-disable-next-line no-case-declarations
                const result = await got(item.link, { https: { rejectUnauthorized: false } });
                // eslint-disable-next-line no-case-declarations
                const $ = cheerio.load(result.data);
                switch (item.type) {
                    case 'index':
                        item.author = $('.meta-item.meta-author').text() + '  ' + $('.meta-item.meta-zan').text() + '  ' + $('.meta-item.meta-read').text();
                        item.pubDate = timezone(parseDate($('.meta-item.meta-time').attr('title'), 'YYYY-MM-DD hh:mm:ss'), +8);
                        item.description = $(artiContent).html();
                        return item;
                    case 'hunter':
                        item.author = $('.meta-item.meta-author').text() + '  ' + $('.meta-item.meta-zan').text() + '  ' + $('.meta-item.meta-read').text();
                        item.pubDate = timezone(parseDate($('.meta-item.meta-time').attr('title'), 'YYYY-MM-DD hh:mm:ss'), +8);
                        item.description = $('.info-content').html();
                        return item;
                }
            })
        )
    );
}

module.exports = {
    ProcessList,
    ProcessFeed,
};
