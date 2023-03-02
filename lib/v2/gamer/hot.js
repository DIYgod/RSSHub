const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const rootUrl = `https://forum.gamer.com.tw/A.php?bsn=${ctx.params.bsn}`;
    const response = await got({
        url: rootUrl,
        headers: {
            Referer: 'https://forum.gamer.com.tw',
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('div.FM-abox2A a.FM-abox2B')
        .map((_, item) => {
            item = $(item);
            return {
                link: `https:${item.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    url: item.link,
                    headers: {
                        Referer: rootUrl,
                    },
                });
                const content = cheerio.load(detailResponse.data);

                content('div.c-post__body__buttonbar').remove();

                item.title = content('.c-post__header__title').text();
                item.description = content('div.c-post__body').html();
                item.author = `${content('a.username').eq(0).text()} (${content('a.userid').eq(0).text()})`;
                item.pubDate = timezone(parseDate(content('a.edittime').eq(0).attr('data-mtime'), +8));

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: rootUrl,
        item: items,
    };

    ctx.state.json = {
        title: $('title').text(),
        link: rootUrl,
        item: items,
    };
};
