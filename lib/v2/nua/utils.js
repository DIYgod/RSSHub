const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

async function ProcessList(newsUrl, baseUrl, listName, listDate, webPageName) {
    const result = await got(newsUrl, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(result.data);

    const pageName = $(webPageName).text();

    let artiLink;

    const items = $(listName)
        .toArray()
        .map((item) => {
            item = $(item);
            if (item.find('a').attr('href').includes('http')) {
                artiLink = item.find('a').attr('href');
            } else {
                artiLink = baseUrl + item.find('a').attr('href');
            }

            return {
                link: artiLink,
                title: item.find('a').attr('title'),
                pubDate: timezone(parseDate(item.find(listDate).first().text(), 'YYYY-MM-DD'), +8),
            };
        });

    return [items, pageName];
}

const ProcessFeed = async (items, artiContent, cache) =>
    await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const result = await got(item.link, {
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const $ = cheerio.load(result.data);

                item.author = $('.arti_publisher').text() + '  ' + $('.arti_views').text();
                item.description = $(artiContent).html();

                return item;
            })
        )
    );

module.exports = {
    ProcessList,
    ProcessFeed,
};
