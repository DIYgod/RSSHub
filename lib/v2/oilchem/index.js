const got = require('@/utils/got');
const cheerio = require('cheerio');
const routes = require('./routes');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const type = ctx.params.type ?? '';
    const category = ctx.params.category ?? '';
    const subCategory = ctx.params.subCategory ?? '';

    const route = category === '' ? '' : `/${category}${subCategory === '' ? '' : `/${subCategory}`}`;

    const rootUrl = `https://${type === '' ? 'www' : 'list'}.oilchem.net`;
    const currentUrl = `${rootUrl}${type === '' ? '/1/' : type === 'list' ? route : `/${routes[`/${type}${route}`]}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.list ul ul li a')
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

                item.description = content('#content').html();
                item.pubDate = timezone(
                    parseDate(
                        content('.xq-head')
                            .find('span')
                            .text()
                            .match(/发布时间：\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/)[0],
                        'YYYY-MM-DD HH:mm'
                    ),
                    +8
                );

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('.hdbox h3').text()} - 隆众资讯`,
        link: currentUrl,
        item: items,
    };
};
