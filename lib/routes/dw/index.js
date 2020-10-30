const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const lang = ctx.params.lang || 'de';
    const caty = ctx.params.caty || 'all';

    const currentUrl = `https://rss.dw.com/rdf/rss-${lang === 'zh' ? 'chi' : lang}-${caty}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);

    const list = $('item')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('title').text(),
                link: item.attr('rdf:about'),
                pubDate: new Date(item.find('dc\\:date').text()).toUTCString(),
                description: item.find('description').text(),
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

                    content('.col1').remove();
                    item.description = content('.longText').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: $('channel title').text(),
        link: response.data.match(/<link>(.*)<\/link>/)[1],
        item: items,
        description: $('channel description').text(),
    };
};
