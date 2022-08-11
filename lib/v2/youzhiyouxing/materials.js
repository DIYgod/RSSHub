const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '';

    const rootUrl = 'https://youzhiyouxing.cn';
    const currentUrl = `${rootUrl}/materials?column_id=${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('li[id*="material"]')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.find('a').attr('href')}`,
                pubDate: parseDate(item.find('.tw-text-t-muted').text(), ['YYYY年M月D日', 'M月D日']),
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

                item.author = content('.tw-inline').text().replace('·', '');
                item.description = content('#zx-material-marker-root')
                    .html()
                    .replace(/(<img.*?) src(=.*?>)/g, '$1 data$2')
                    .replace(/(<img.*?) data-src(=.*?>)/g, '$1 src$2');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `有知有行 - ${$(`a[phx-value-column_id="${id === '' ? 0 : id}"]`).text()}`,
        link: currentUrl,
        item: items,
    };
};
