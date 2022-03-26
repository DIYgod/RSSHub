const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const todo = ctx.params.do ?? '';
    const keyword = ctx.params.keyword ?? '';

    const rootUrl = 'https://www.ruancan.com';
    const currentUrl = `${rootUrl}${todo ? (todo === 'search' ? `/page/1?s=${keyword}` : `/${todo}/${keyword}`) : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.item-title a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.author = content('.author-name').text();
                item.pubDate = parseDate(content('.published').attr('datetime'));
                item.description = content('.entry-content').html();

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
