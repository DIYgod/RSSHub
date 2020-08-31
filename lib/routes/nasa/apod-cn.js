const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = `https://www.nasachina.cn/apotd`;
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('div.post-archive article')
        .slice(0, 3)
        .map((_, item) => {
            item = $(item);
            const a = item.find('h2.entry-title a');
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
                    const content = cheerio.load(detailResponse.data);

                    content('#wpd-post-rating').remove();

                    item.description = content('#main article').html();

                    let date;

                    if (content('h4').text()) {
                        date = content('h4').text().replace(/(年|月)/g, '-').replace(/日/, '');
                        item.title += ` | ${content('h4').text()}`;
                    } else {
                        date = new Date(content('time.entry-date').attr('datetime'));
                        const year = date.getFullYear().toString();
                        const month = (date.getMonth() + 1).toString().padStart(2, '0');
                        const day = date.getDate().toString().padStart(2, '0');
                        item.title += ` | ${year}年${month}月${day}日`;
                    }

                    item.pubDate = new Date(date).toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: 'NASA中文 - 天文·每日一图',
        link: rootUrl,
        item: items,
    };
};
