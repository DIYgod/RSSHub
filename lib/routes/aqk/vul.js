const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://www.anquanke.com';

    const response = await got.get(`${url}/vul`);
    const $ = cheerio.load(response.data);
    const list = $('table>tbody>tr').get();

    const items = list.map((i) => {
        const item = $(i);

        const title = item.find('td:first-child a').text();
        const cve = item.find('td:nth-child(2)').text();
        const pla = item.find('.vul-type-item').text().replace(/\s+/g, '');
        const date = new Date(item.find('td:nth-last-child(2)').text().replace(/\s+/g, '')).toUTCString();
        const href = item.find('a').attr('href');

        return {
            title: `${title}【${cve}】${pla !== '未知' ? pla : ''}`,
            description: `编号:${cve} | 平台:${pla}`,
            pubDate: date,
            link: `${url}${href}`,
        };
    });

    ctx.state.data = {
        title: '安全客-漏洞cve报告',
        link: 'https://www.anquanke.com/vul',
        item: items,
    };
};
