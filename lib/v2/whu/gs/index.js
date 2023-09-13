const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const gsIndexMap = new Map([
    [0, 'xwdt.htm'],
    [1, 'xs_ts.htm'],
    [2, 'yxfc.htm'],
    [3, 'tzgg/qb.htm'],
    [4, 'tzgg/zs.htm'],
    [5, 'tzgg/py.htm'],
    [6, 'tzgg/xw.htm'],
    [7, 'tzgg/zlyzyxw.htm'],
    [8, 'tzgg/zh.htm'],
]);

module.exports = async (ctx) => {
    const host = 'https://gs.whu.edu.cn/';
    const type = (ctx.params && parseInt(ctx.params.type)) || 0;
    const response = await got(host + gsIndexMap.get(type));

    const $ = cheerio.load(response.data);
    const feed_title = $('div.location a')
        .slice(-2)
        .map((index, element) => $(element).text())
        .get()
        .join(' > ');

    let items = $('.list ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            const link = item.find('a').attr('href');
            return {
                title: item.find('p').text(),
                link: link.startsWith('http') ? link : new URL(link, host).href,
                pubDate: parseDate(item.find('span').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const detail = await got(item.link);
                    const content = cheerio.load(detail.data);

                    content('input').remove();
                    content('h1').remove();
                    content('h2').remove();
                    content('div.arc-tit h2').remove();
                    content('h4.information').remove();
                    content('div.arc-info').remove();
                    content('.con_xq').remove();

                    content('form[name=_newscontent_fromname] img').each((_, i) => {
                        i = $(i);
                        if (i.attr('src').startsWith('/')) {
                            i.attr('src', new URL(i.attr('src'), host).href);
                        }
                    });
                    content('form[name=_newscontent_fromname] ul li a').each((_, a) => {
                        a = $(a);
                        if (a.attr('href').startsWith('/')) {
                            a.attr('href', new URL(a.attr('href'), host).href);
                        }
                    });

                    item.description = content('form[name=_newscontent_fromname]').html();
                    return item;
                } catch (error) {
                    item.description = 'NULL';
                    return item;
                }
            })
        )
    );

    ctx.state.data = {
        title: `武汉大学研究生院 - ${feed_title}`,
        link: host + gsIndexMap.get(type),
        description: '武大研究生院',
        item: items,
    };
};
