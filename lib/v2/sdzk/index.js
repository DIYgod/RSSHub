const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const bcid = ctx.params.bcid ?? '1';
    const cid = ctx.params.cid ?? '16';

    const rootUrl = 'https://www.sdzk.cn';
    const currentUrl = `${rootUrl}/NewsList.aspx?BCID=${bcid}${cid ? `&CID=${cid}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('a[title]')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.attr('href'), rootUrl).href,
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

                const info = content('div.laylist-r em').text();

                item.description = content('.txt').html();
                item.pubDate = parseDate(info.split('发布时间：').pop());

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
