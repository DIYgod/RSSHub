const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '31';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 20;

    const rootUrl = 'https://www.right.com.cn';
    const currentUrl = `${rootUrl}/forum/forum-${id}-1.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('a[title="隐藏置顶帖"]').each(function () {
        $(this).parents('tbody').remove();
    });

    let items = $('.s')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}/forum/${item.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                content('.pstatus').remove();

                item.author = content('.authi').first().text();
                item.description = content('.t_f').first().html();
                item.pubDate = timezone(parseDate(content('.authi em').first().text().replace('发表于 ', '')), +8);
                item.category = content('.ptg a')
                    .toArray()
                    .map((a) => content(a).text());

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('.xs2 a').text()} - 恩山无线论坛`,
        link: currentUrl,
        item: items,
    };
};
