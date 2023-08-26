const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30;

    const rootUrl = 'http://www.globallawreview.org';

    const { data: firstResponse } = await got(rootUrl);

    let $ = cheerio.load(firstResponse);

    const currentUrl = new URL($('p.tabBtn span a').prop('href'), rootUrl).href;

    const { data: response } = await got(currentUrl);

    $ = cheerio.load(response);

    const items = $('ul.digest li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('p.p1 a');
            const link = new URL(a.prop('href'), rootUrl).href;

            return {
                title: a.text(),
                link,
                description: item.find('p.p2').html(),
                author: item.find('p.p3 span').text() || a.text().split('：')[0],
                category: [
                    item
                        .find('p.p4')
                        .text()
                        .match(/] (\d+\.\d+);/)[1],
                ],
                enclosure_url: link,
                enclosure_length:
                    item
                        .find('p.p4')
                        .text()
                        .match(/(\d+(\.\d+)?)\sKB/)[1] * 1000,
            };
        });

    ctx.state.data = {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        language: 'zh-cn',
        author: '中国社会科学院法学研究所',
    };
};
