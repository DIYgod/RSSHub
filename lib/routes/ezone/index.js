const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || '';

    const rootUrl = 'https://ezone.ulifestyle.com.hk';
    const currentUrl = `${rootUrl}/${category || '/getLastestPageRight/latestNews'}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let list = [];
    const $ = cheerio.load(response.data);

    if (category) {
        list = $('.item-grid')
            .slice(0, 10)
            .map((_, item) => {
                item = $(item);
                return {
                    link: `${rootUrl}${item.attr('href')}`,
                };
            })
            .get();
    } else {
        list = response.data[0][1].items.map((item) => ({
            title: item.headlines.items[0].name,
            link: `${rootUrl}/article/${item.standardDocumentId}`,
            pubDate: new Date(item.publishDateStr).toUTCString(),
        }));
    }

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);
                    const pubDate = detailResponse.data.match(/<span>(\d{2}-\d{2}-\d{4} \d{2}:\d{2})<\/span>/)[1];

                    item.title = content('h2').eq(0).text();
                    item.description = content('.content').html();
                    item.pubDate = item.pubDate || new Date(`${pubDate.substr(6, 4)}-${pubDate.substr(0, 5)} ${pubDate.substr(11, 5)}`).toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${category ? $('h1').text() : '最新內容'} - ezone.hk`,
        link: category ? currentUrl : rootUrl,
        item: items,
    };
};
