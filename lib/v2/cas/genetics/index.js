const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://genetics.cas.cn';

module.exports = async (ctx) => {

    // Examples:
    //   - jixs/yg                 学术预告
    //   - dtxw/kyjz               科研进展
    //   - edu/zsxx/ssszs_187556   硕士生招生
    //   - edu/zsxx/bsszs_187557   博士生招生

    const { path } = ctx.params;

    const currentUrl =`${baseUrl}/${path}/`;

    const { data: response } = await got(currentUrl);
    const $ = cheerio.load(response);

    let items;

    if (path.substring(0, 3) === "edu") {  // 招生信息

        items = $('li.box-s.h16')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('a').first();
                const date = item.find('.box-date').first();
                return {
                    title: a.text(),
                    link: new URL(a.attr('href'), currentUrl).href,
                    pubDate: parseDate(date.text(), 'YYYY-MM-DD'),
                };
            });

    } else {  // 主站

        items = $('li.row.no-gutters.py-1')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('a').first();
                const date = item.find('.col-news-date').first();
                return {
                    title: a.text(),
                    link: new URL(a.attr('href'), currentUrl).href,
                    pubDate: parseDate(date.text(), 'YYYY.MM.DD'),
                };
            });

    }

    ctx.state.data = {
        title: $('head title').text(),
        link: currentUrl,
        item: items,
    };
};
