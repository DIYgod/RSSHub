const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

async function ProcessList(newsUrl, baseUrl, listName) {
    const result = await got(newsUrl, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(result.data);

    const items = $(listName)
    .toArray()
    .map((item) => {
        item = $(item);

        if (item.find('a').attr('href').includes('https://')) {
            artiLink = item.find('a').attr('href');
        } else {
            artiLink = baseUrl + item.find('a').attr('href');
        }

        return {
            link: artiLink,
            title: item.find('a').attr('title'),
            pubDate: timezone(parseDate(item.find('.news_meta').first().text(), 'YYYY-MM-DD'), +8),
        };
    });

    return items;
}

async function ProcessPageName(newsUrl, webPageName) {
    const result = await got(newsUrl, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(result.data);

    pageName = $(webPageName).text();

    return pageName;
}

const ProcessFeed = async (items, cache) =>
    await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const result = await got(item.link, {
                        https: {
                            rejectUnauthorized: false,
                        },
                    });
                    const $ = cheerio.load(result.data);

                    item.author = $('.arti_publisher').text() + '  ' + $('.arti_views').text();
                    item.description = $('.read').html();

                    return item;
                } catch (error) {
                    item.description = '数据有误，请点击链接访问。';

                    return item;
                }
            })
        )
    );

module.exports = {
    ProcessList,
    ProcessPageName,
    ProcessFeed,
};
