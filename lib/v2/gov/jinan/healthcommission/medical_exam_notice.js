const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://jnmhc.jinan.gov.cn';

    const res = await got('https://jnmhc.jinan.gov.cn/module/web/jpage/dataproxy.jsp', {
        searchParams: {
            page: 1,
            webid: 28,
            path: '/',
            columnid: 14418,
            unitid: 18878,
            webname: '济南市卫生健康委员会',
            permissiontype: 0,
        },
    });

    const $ = cheerio.load(res.data, { xmlMode: true });

    const list = $('record');

    ctx.state.data = {
        title: '济南卫建委-执业考试通知',
        link: `${baseUrl}/col/col14418/index.html`,
        item: list
            .map((_, item) => {
                // 获取每个item对应的html字符串
                item = $(item).text();

                // 解析上一步中的html
                const html = cheerio.load(item);

                const title = html('td[width="620"] a').attr('title');
                const link = html('td[width="620"] a').attr('href');
                const date = timezone(parseDate(html('td[width="100"]').text()), +8);
                return {
                    title,
                    description: title,
                    pubDate: date,
                    link,
                    author: '济南市卫生健康委员会',
                };
            })
            .get(),
    };
};
