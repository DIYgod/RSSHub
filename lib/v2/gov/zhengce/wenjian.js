const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const { pcodeJiguan } = ctx.params;
    const link = 'http://sousuo.gov.cn/list.htm';
    const res = await got(link, {
        searchParams: {
            n: ctx.query.limit ? Number(ctx.query.limit) : 20,
            sort: 'pubtime',
            t: 'paper',
            pcodeJiguan: pcodeJiguan ? pcodeJiguan : '',
        },
    });
    const $ = cheerio.load(res.data);

    const list = $('body > div.dataBox > table > tbody > tr')
        .slice(1)
        .toArray()
        .map((elem) => {
            elem = $(elem);
            return {
                title: elem.find('td:nth-child(2) > a').text(),
                link: elem.find('td:nth-child(2) > a').attr('href'),
                pubDate: timezone(parseDate(elem.find('td:nth-child(5)').text()), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const contentData = await got(item.link);
                const $ = cheerio.load(contentData.data);
                item.description = $('#UCAP-CONTENT').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '最新文件 - 中国政府网',
        link: res.url,
        item: items,
    };
};
