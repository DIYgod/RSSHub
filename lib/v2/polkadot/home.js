const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://polkadot.network/blog/',
    });

    const $ = cheerio.load(response.data);
    const list = $('.container .row .card > div > a:nth-child(2)');
    const items = await Promise.all(
        list
            .map((_, originItem) => {
                const item = {
                    title: $(originItem).find('h5').text().trim(),
                    author: '',
                    description: 'Polkadot',
                    pubDate: '',
                    link: 'https://polkadot.network' + $(originItem).attr('href')
                };
                return ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);
                    item.author = content('.container .my-3 .d-flex>span.text-small').text();
                    item.pubDate = timezone(parseDate(content('.container .date-i18n').text()), 0);
                    return item;
                });
            })
            .get()
    );
    ctx.state.data = {
        title: 'Polkadot-blog',
        link: 'https://polkadot.network/blog/',
        item: items
    };
};
