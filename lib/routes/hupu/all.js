const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://bbs.hupu.com';
    const currentUrl = `${rootUrl}/all-${ctx.params.caty}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);

    const list = $('div.list ul li')
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);
            const a = item.find('span.textSpan a[title]');
            return {
                title: a.attr('title'),
                link: `${rootUrl}${a.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    try {
                        const detailResponse = await got({
                            method: 'get',
                            url: item.link,
                        });
                        const content = cheerio.load(detailResponse.data);

                        item.description = content('div.quote-content').html();
                        item.author = content('div.author div.left a.u').eq(0).text();
                        item.pubDate = new Date(content('span.stime').eq(0).text() + ' GMT+8').toUTCString();

                        return item;
                    } catch (error) {
                        return Promise.resolve('');
                    }
                })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
