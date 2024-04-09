const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate, parseRelativeDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const rootUrl = 'http://www.dayanzai.me/';

module.exports = async (ctx) => {
    const { category, fulltext } = ctx.params;
    const currentUrl = rootUrl + category;
    const response = await got.get(currentUrl);
    const $ = cheerio.load(response.data);
    const lists = $('div.c-box > div > div.c-zx-list > ul > li');
    const reg = /日期：(.*?(\s\(.*?\))?)\s/;
    const list = lists
        .map((index, item) => {
            item = $(item).find('div');
            let date = reg.exec(item.find('div.r > p.other').text())[1];
            if (date.indexOf('周') !== -1 || date.indexOf('月') !== -1) {
                date = /\((.*?)\)/.exec(date)[1];
                date = parseDate(date, 'MM-DD');
            } else if (date.indexOf('年') !== -1) {
                date = /\((.*?)\)/.exec(date)[1];
                date = parseDate(date, 'YYYY-MM-DD');
            } else {
                date = parseRelativeDate(date);
            }
            return {
                title: item.find('div.r > p.r-top > span > a').text(),
                pubDate: timezone(date, +8),
                description: item.find('div.r > p.desc').text(),
                link: item.find('div.r > p.r-top > span > a').attr('href'),
            };
        })
        .get();
    let items;
    if (fulltext === 'y') {
        items = await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got.get(item.link);
                    const content = cheerio.load(detailResponse.data);
                    item.description = content('div.intro-box').html();
                    return item;
                })
            )
        );
    } else {
        items = list;
    }

    ctx.state.data = {
        title: `大眼仔旭 ${category}`,
        link: currentUrl,
        description: `大眼仔旭 ${category} RSS`,
        item: items,
    };
};
