const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = 'https://www.ndss-symposium.org';
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    // use wordpress api to get data
    const { data } = await got(`${url}/wp-json/wp/v2/pages?slug=accepted-papers`);

    const items = await Promise.all(
        data.map(async (elem) => {
            const $ = cheerio.load(elem.content.rendered);
            const link = elem.link;
            const pubDate = parseDate(elem.date);

            const divMatch = $('div h3')
                .toArray()
                .map((item) => {
                    item = $(item);
                    const title = item.text().trim();
                    return {
                        title,
                        author: item.siblings().text().trim().replaceAll('\n', '').replace(/\s+/g, ' '),
                        link: item.siblings('a').attr('href'),
                        pubDate,
                    };
                });
            if (divMatch.length > 0) {
                const items = await Promise.all(
                    divMatch.map((item) => {
                        if (item.link) {
                            return ctx.cache.tryGet(item.link, async () => {
                                // some titles and authos are not complete
                                const response = await got(item.link);
                                const $ = cheerio.load(response.body);
                                item.description = $('.paper-data').text().trim().replaceAll('\n', '');
                                item.title = $('h1.entry-title').text().trim().replaceAll('\n', '').replace(/\s+/g, ' ');
                                item.author = $('h1.entry-title').siblings().text().trim().replaceAll('\n', '').replace(/\s+/g, ' ');
                                return item;
                            });
                        } else {
                            item.link = `${link}#${item.title}`;
                            return item;
                        }
                    })
                );
                return items;
            } else {
                const pMatch = $('p strong')
                    .toArray()
                    .map((item) => {
                        item = $(item);
                        const title = item.text().trim();
                        return {
                            title,
                            author: item
                                .parent()
                                .contents()
                                .filter((_, e) => e.nodeType === 3)
                                .text()
                                .trim()
                                .replaceAll('\n', '')
                                .replace(/\s+/g, ' '),
                            link: `${link}#${title}`,
                            pubDate,
                        };
                    });
                return pMatch;
            }
        })
    );

    ctx.state.data = {
        title: 'NDSS',
        link: url,
        description: 'The Network and Distributed System Security (NDSS) Symposium Accpeted Papers',
        allowEmpty: true,
        item: items.flat(),
    };
};
