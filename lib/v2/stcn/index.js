const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? 'yw';

    const rootUrl = 'https://www.stcn.com';
    const currentUrl = `${rootUrl}/article/list/${id}.html`;
    const apiUrl = `${rootUrl}/article/list.html?type=${id}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.t, .tt, .title')
        .find('a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text().replace(/(^【|】$)/g, ''),
                link: `${rootUrl}${item.attr('href')}`,
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

                item.title = content('.detail-title').text();
                item.author = content('.detail-info span').first().text().split('：').pop();
                item.pubDate = timezone(parseDate(content('.detail-info span').last().text()), +8);
                item.category = content('.detail-content-tags div')
                    .toArray()
                    .map((t) => content(t).text());
                item.description = content('.detail-content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `证券时报网 - ${$('.breadcrumb a').last().text()}`,
        link: currentUrl,
        item: items,
    };
};
