const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'Media_list';

    const rootUrl = 'https://www.ccf.org.cn';
    const currentUrl = `${rootUrl}/${category}/`;
    const response = await got(currentUrl);

    const $ = cheerio.load(response.data);

    const list = $('.tit a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                content('.new_info .num').remove();

                item.description = content('.txt').html();
                item.pubDate = parseDate(content('.new_info span').text());

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
