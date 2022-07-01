const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const language = ctx.params.language ?? 'tc_chi';

    const rootUrl = 'https://www.dh.gov.hk';
    const currentUrl = `${rootUrl}/${language}/press/press.html`;
    const textonlyUrl = `${rootUrl}/textonly/${language}/press/press.html`;

    const response = await got({
        method: 'get',
        url: textonlyUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('td[headers="title"]')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.find('a').attr('href'),
                pubDate: parseDate(item.next().text(), language === 'english' ? 'D-MMMM-YYYY' : 'YYYY年M月D日'),
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

                item.description = content('#pressrelease').html();

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
