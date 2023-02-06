const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const baseUrl = 'https://www.cast.org.cn';

module.exports = async (ctx) => {
    const { column = 457 } = ctx.params;
    const { limit = 10 } = ctx.query;
    const link = `${baseUrl}/col/col${column}/index.html`;
    const { data: response } = await got.post(`${baseUrl}/module/web/jpage/dataproxy.jsp`, {
        searchParams: {
            startrecord: 1,
            endrecord: limit,
            perpage: limit,
        },
        form: {
            col: 1,
            appid: 1,
            webid: 1,
            path: '/',
            columnid: column,
            sourceContentType: 1,
            unitid: 335,
            webname: '中国科学技术协会',
            permissiontype: 0,
        },
    });

    const $ = cheerio.load(response, {
        xml: {
            xmlMode: true,
        },
    });

    const pageTitle = await ctx.cache.tryGet(link, async () => {
        const { data: response } = await got(link);
        const $ = cheerio.load(response);
        return $('head title').text();
    });

    const list = $('record')
        .toArray()
        .map((item) => {
            item = cheerio.load($(item).html(), null, false);
            const a = item('a').first();
            return {
                title: a.text(),
                pubDate: parseDate(item('.list-data').text().trim(), 'DDYYYY/MM'),
                link: `${baseUrl}${a.attr('href')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                item.description = $('#zoom').html();
                item.pubDate = timezone(parseDate($('meta[name=PubDate]').attr('content'), 'YYYY-MM-DD HH:mm'), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: pageTitle,
        link,
        image: 'https://www.cast.org.cn/favicon.ico',
        item: items,
    };
};
