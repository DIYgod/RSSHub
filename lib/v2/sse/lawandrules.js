const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const slug = ctx.params.slug ?? 'latest';

    const rootUrl = 'https://www.sse.com.cn';
    const currentUrl = `${rootUrl}/lawandrules/guide/${slug.replace(/-/g, '/')}`;
    const response = await got(currentUrl);

    const $ = cheerio.load(response.data);

    const list = $('.sse_list_1 dl dd')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: `${rootUrl}${item.find('a').attr('href')}`,
                pubDate: parseDate(item.find('span').text().trim()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                item.description = content('.allZoom').html();

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
