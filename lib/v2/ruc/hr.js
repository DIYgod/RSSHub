const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category?.replace(/-/g, '/') ?? 'tzgg';

    const rootUrl = 'http://hr.ruc.edu.cn';
    const currentUrl = `${rootUrl}/${category}/index.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('a[title]')
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text(),
                link: `${rootUrl}${link.indexOf('..') === 0 ? link.replace(/\.\./, '') : `/${category}/${link}`}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    item.description = content('.neirong').html();
                    item.pubDate = parseDate(detailResponse.data.match(/日期：(\d{4}-\d{2}-\d{2})/)[1]);
                } catch (err) {
                    item.description = 'Not Found';
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
