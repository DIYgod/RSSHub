const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { category, type } = ctx.params;

    const rootUrl = 'https://dwxgb.bnu.edu.cn';
    let currentUrl = `${rootUrl}/${category}/${type}/index.html`;

    let response;
    try {
        response = await got({
            method: 'get',
            url: currentUrl,
        });
    } catch (e) {
        currentUrl = `${rootUrl}/${category}/${type}/index.htm`;
        response = await got({
            method: 'get',
            url: currentUrl,
        });
    }

    const $ = cheerio.load(response.data);

    const list = $('ul.container.list > li')
        .map((_, item) => ({
            title: $(item).find('a').text().trim(),
            pubDate: parseDate($(item).find('span').text()),
            link: `${rootUrl}/${category}/${type}/${$(item).find('a').attr('href')}`,
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('div.article.typo').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('div.breadcrumb1 > a:nth-child(3)').text()} - ${$('div.breadcrumb1 > a:nth-child(4)').text()}`,
        link: currentUrl,
        item: items,
    };
};
