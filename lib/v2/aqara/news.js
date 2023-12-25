const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 35;

    const rootUrl = 'https://www.aqara.cn';
    const currentUrl = new URL('news', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = response
        .match(/(parm\.newsTitle[\s\S]*?arr\.push\(parm\))/g)
        .slice(0, limit)
        .map((item) => ({
            title: item.match(/parm\.newsTitle = '(.*?)'/)[1],
            link: new URL(item.match(/parm\.contentHerf = '(\d+)'/)[1], rootUrl).href,
            pubDate: parseDate(item.match(/parm\.issueTime = '(.*?)'/)[1], 'YYYY  年  MM  月  DD  日'),
        }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                item.title = content('h4.fnt_56').last().text();
                item.description = content('div.news_body').html();
                item.pubDate = parseDate(content('div.news_date').first().text(), 'YYYY  年  MM  月  DD  日');

                return item;
            })
        )
    );

    const icon = $('link[rel="shortcut icon"]').prop('href').split('?')[0];

    ctx.state.data = {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-cn',
        image: $('meta[property="og:image"]').prop('content'),
        icon,
        logo: icon,
        author: $('meta[name="author"]').prop('content'),
    };
};
