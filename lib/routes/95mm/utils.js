const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx, title, rootUrl) => {
    const response = await got({
        method: 'get',
        url: rootUrl,
        header: {
            Referer: 'https://www.95mm.net',
        },
    });

    const $ = cheerio.load(response.data);

    const list = $('div.list-body')
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: a.attr('href'),
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
                    const images = detailResponse.data.match(/src": '(.*?)',"width/g);

                    item.description = '';

                    for (const i of images) {
                        item.description += `<img src="${i.split("'")[1]}">`;
                    }

                    return item;
                })
        )
    );

    return {
        title: `${title} - MM范`,
        link: rootUrl,
        item: items,
    };
};
