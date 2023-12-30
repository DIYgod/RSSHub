const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.asml.com';
    const currentUrl = `${rootUrl}/en/news/press-releases`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data.match(/<a class="results-list__listitem" href="(.*)">/g).map((item) => ({
        link: `${rootUrl}${item.split('href="')[1].replace('">', '')}`,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                item.title = content('title').text().replace('| ASML', '');
                item.description = content('.longcopy').html();
                item.pubDate = new Date(detailResponse.data.match(/"datePublished": "(.*)",/)[1]).toUTCString();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Press releases | ASML',
        link: currentUrl,
        item: items,
    };
};
