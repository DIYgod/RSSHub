const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://youzhiyouxing.cn';

module.exports = async (ctx) => {
    const column = ctx.params.column ?? '0';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 30;
    const url = `${rootUrl}/materials?column=${column}&limit=${limit}`;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const title = $(`a[phx-value-column="${column}"]`).text() === '' ? '全部' : $(`a[phx-value-column="${column}"]`).text();
    const list = $('[phx-click=material]')
        .map((_, item) => ({
            title: $(item).find('h3').text(),
            link: `${rootUrl}/materials/${$(item).attr('phx-value-id')}`,
            pubDate: parseDate($(item).find('div.xs-text.muted-text.tw-text-right').text(), ['YYYY年M月D日', 'M月D日']),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                item.description = content('#zx-rangy-root')
                    .html()
                    .replace(/(<img.*?) src(=.*?>)/g, '$1 data$2')
                    .replace(/(<img.*?) data-src(=.*?>)/g, '$1 src$2');
                item.author = content('span.tw-inline').text().replace('·', '');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `有知有行 - ${title}`,
        link: url,
        description: `有知有行 - ${title}`,
        item: items,
    };
};
