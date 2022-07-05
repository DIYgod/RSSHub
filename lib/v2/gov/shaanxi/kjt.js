const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '221';

    const rootUrl = 'https://kjt.shaanxi.gov.cn';
    const currentUrl = `${rootUrl}/view/iList.jsp?cat_id=${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.textlist li a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: parseDate(item.prev().text()),
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

                item.description = content('.info_content').html();
                item.author = content('meta[name="Author"]').attr('content');
                item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').attr('content')), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `陕西省科学技术厅 - ${$('.catnm').text()}`,
        link: currentUrl,
        item: items,
    };
};
