const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootURL = 'https://www.cncf.io';

module.exports = async (ctx) => {
    const url = `${rootURL}/reports/`;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const list = $('div.report-item')
        .map((_index, item) => ({
            title: $(item).find('a.report-item__link').attr('title'),
            link: $(item).find('a.report-item__link').attr('href'),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                item.parseDate = parseDate(content('p.is-style-spaced-uppercase').splice(':')[1]);
                item.description = content('article > div.has-background').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `CNCF - Reports`,
        link: url,
        item: items,
    };
};
