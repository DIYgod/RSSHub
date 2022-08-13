const got = require('@/utils/got');
const cheerio = require('cheerio');

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
                let item = {
                    title: $(originItem).find('h5').text().trim(),
                    author: '',
                    description: 'Polkadot',
                    pubDate: new Date().toUTCString(),
                    link: 'https://polkadot.network/' + $(originItem).attr('href')
                }
                return ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: link,
                    });
                    const content = cheerio.load(detailResponse.data);
                    item.author = content('.container .my-3 .d-flex>span.text-small').text();
                    return item;
                })
            })
            .get()
    );
    ctx.state.data = {
        title: 'Polkadot-blog',
        link: 'https://polkadot.network/blog/',
        item: items
    };
};
