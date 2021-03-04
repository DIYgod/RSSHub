const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const city = ctx.params.city;

    let response = await got({
        method: 'get',
        url: `http://${city}.bendibao.com/`,
    });

    let $ = cheerio.load(response.data);
    const title =
        $('title')
            .text()
            .replace(/-爱上本地宝，生活会更好/, '') + `焦点资讯`;

    let list = $('ul.focus-news li')
        .map((_, item) => {
            item = $(item).find('a');
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    // Cities share 2 sets of ui.
    //
    // eg1. http://bj.bendibao.com/
    // eg2. http://kel.bendibao.com/
    //
    // Go to /news to fetch data for the eg2 case.

    if (!list.length) {
        response = await got({
            method: 'get',
            url: `http://${city}.bendibao.com/news`,
        });

        $ = cheerio.load(response.data);

        list = $('#listNewsTimeLy div.info')
            .map((_, item) => {
                item = $(item).find('a');
                return {
                    title: item.text(),
                    link: item.attr('href'),
                };
            })
            .get();
    }

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    try {
                        const detailResponse = await got({ method: 'get', url: item.link });
                        const content = cheerio.load(detailResponse.data);

                        // Some links lead to mobile-view pages.
                        // eg. http://m.bj.bendibao.com/news/273517.html
                        // Divs for contents are different from which in desktop-view pages.

                        item.description = content('div.content').html() || content('div.content-box').html();

                        // Spans for publish dates are the same cases as above.

                        item.pubDate = new Date((content('span.time').text().replace(/发布时间：/, '') || content('span.public_time').text()) + ' GMT+8').toUTCString();

                        return item;
                    } catch (e) {
                        return Promise.resolve('');
                    }
                })
        )
    );

    ctx.state.data = {
        title,
        link: `http://${city}.bendibao.com/`,
        item: items,
    };
};
