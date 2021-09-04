const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'http://www.gov.cn';

module.exports = async (ctx) => {
    const currentUrl = `${rootUrl}/shuju/${ctx.params.caty}/${ctx.params.item}.htm`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('ul li')
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: url.resolve(rootUrl, a.attr('href')),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    content('.font').remove();
                    content('.pages_print').remove();

                    item.pubDate = new Date(content('div.pages-date').text().trim()).toUTCString();
                    item.description = content('#UCAP-CONTENT').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
