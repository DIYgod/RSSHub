const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const status = ['action', 'upcoming', 'recent'];

    const language = ctx.params.language ?? 'en';

    let rated = ctx.params.rated ?? '0';
    const category = ctx.params.category ?? '0';
    const keyword = ctx.params.keyword ?? '';

    rated = rated === 'active' ? 'action' : rated;
    const isStatus = status.includes(rated);

    const rootUrl = 'https://atcoder.jp';
    const currentUrl = `${rootUrl}/contests${isStatus ? `?lang=${language}` : `/archive?lang=${language}&ratedType=${rated}&category=${category}${keyword ? `&keyword=${keyword}` : ''}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $(isStatus ? `#contest-table-${rated}` : '.row')
        .find('tr')
        .slice(1, ctx.query.limit ? parseInt(ctx.query.limit) : 20)
        .toArray()
        .map((item) => {
            item = $(item).find('td a').eq(1);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}?lang=${language}`,
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

                item.description = content(`.lang-${language}`).html();
                item.pubDate = parseDate(content('.fixtime-full').first().text());

                return item;
            })
        )
    );

    ctx.state.data = {
        title: String(isStatus ? `${$(`#contest-table-${rated} h3`).text()} - AtCoder` : $('title').text()),
        link: currentUrl,
        item: items,
        allowEmpty: true,
    };
};
