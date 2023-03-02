const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const params = ctx.params[0] ?? 'kjzx/tzgg';

    const rootUrl = 'http://kjt.ah.gov.cn';
    const currentUrl = `${rootUrl}/${params}/index.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.doc_list li')
        .not('.columnName')
        .find('a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
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

                item.description = content('.wzcon').html();
                item.author = content('meta[name="Author"]').attr('content');
                item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').attr('content')), +8);

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
