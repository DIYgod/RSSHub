const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://link.sthj.sh.gov.cn/aqi/index.jsp';
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = cheerio.load(response.data);
    const aqi = $('div.val').text();
    const time = new Date().getFullYear() + '-' + $('span.t-time').eq(0).text().replace(/\s+/g, '').replace('月', '-').replace('日', ' ').replace('时', ':00:00');

    ctx.state.data = {
        title: '上海市生态环境局 - 空气质量',
        link: link,
        item: [
            {
                title: aqi + ' - ' + time,
                link: link,
                description: $('table.table').html() + $('div.air-yb').html(),
                pubDate: new Date(time + ' GMT+8').toUTCString(),
            },
        ],
    };
};
