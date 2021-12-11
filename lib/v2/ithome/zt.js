const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://www.ithome.com';
    const currentUrl = `${rootUrl}/zt/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.newsbody a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('.post_content').html();
                item.author = content('#author_baidu').text().replace('作者：', '');
                item.pubDate = timezone(parseDate(content('#pubtime_baidu').text()), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('title').text()} - IT之家`,
        link: currentUrl,
        item: items,
    };
};
