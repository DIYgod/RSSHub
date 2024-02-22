const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { category, type } = ctx.params;

    const rootUrl = 'https://dwxgb.bnu.edu.cn';
    const currentUrl = `${rootUrl}/${category}/${type}/index.html`;

    let response;
    try {
        response = await got(currentUrl);
    } catch {
        try {
            response = await got(`${rootUrl}/${category}/${type}/index.htm`);
        } catch {
            return;
        }
    }

    const $ = cheerio.load(response.data);

    const list = $('ul.container.list > li')
        .map((_, item) => {
            const link = $(item).find('a').attr('href');
            const absoluteLink = new URL(link, currentUrl).href;
            return {
                title: $(item).find('a').text().trim(),
                pubDate: parseDate($(item).find('span').text()),
                link: absoluteLink,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
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
