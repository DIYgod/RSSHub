const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category?.replace(/-/g, '/') ?? 'zxgg';

    const rootUrl = 'https://hr.pku.edu.cn/';
    const currentUrl = `${rootUrl}/${category}/index.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.item-list li a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text().replace(/\d+、/, ''),
                link: `${rootUrl}/${category}/${item.attr('href')}`,
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

                content('.title').remove();

                item.description = content('.article').html();
                item.pubDate = parseDate(content('#date').text());

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('h2').text()} - ${$('title').text()}`,
        link: currentUrl,
        item: items,
    };
};
