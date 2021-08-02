const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const tab = ctx.params.tab || 'All';

    const rootUrl = 'https://dbaplus.cn';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $(`#tab${tab} li`)
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);

            return {
                link: item.find('a').eq(0).attr('href'),
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

                    item.title = content('h2.title').text();
                    item.author = content('span.user').text();
                    item.description = content('.new-detailed').html();
                    item.pubDate = new Date(content('span.time').eq(0).text()).toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${response.data.match(`<a href="#tab${tab}" data-toggle="tab">(.*)</a>`)[1]} - dbaplus社群`,
        link: rootUrl,
        item: items,
    };
};
