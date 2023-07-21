const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10;

    const path = ctx.path === '/yjsy' ? '/tzgg' : ctx.path.replace(/^\/yjsy/, '');

    const rootUrl = 'https://yjsy.nenu.edu.cn';
    const currentUrl = `${rootUrl}${path}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('a.tit')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text(),
                link: /^http/.test(link) ? link : new URL(link, rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (/yjsy\.nenu\.edu\.cn/.test(item.link)) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    item.title = content('h2').text();
                    item.description = content('.v_news_content').html();
                    item.pubDate = parseDate(
                        content('h3')
                            .text()
                            .match(/(\d{4}-\d{2}-\d{2})/)[1]
                    );
                }

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
