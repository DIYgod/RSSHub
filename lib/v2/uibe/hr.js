const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'tzgg';
    const type = ctx.params.type ?? '';

    const rootUrl = 'http://hr.uibe.edu.cn';
    const currentUrl = `${rootUrl}/${category}${type ? `/${type}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.lawul, .longul')
        .find('li a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('p').text(),
                link: `${currentUrl}/${item.attr('href')}`,
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

                    item.description = content('.gp-article').html();
                    item.pubDate = parseDate(content('#shareTitle').next().text().replace('时间：', ''));
                } catch (err) {
                    item.description = 'Not Found';
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('.picTit').text()} - 对外经济贸易大学人力资源处`,
        link: currentUrl,
        item: items,
    };
};
