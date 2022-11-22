const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { parseDate } = require('@/utils/parse-date');
const baseUrl = 'http://wlwz.changsha.gov.cn';

module.exports = async (ctx) => {
    const listPage = await got('http://wlwz.changsha.gov.cn/webapp/cs2020/email/index.jsp', {
        responseType: 'buffer',
    });
    listPage.data = iconv.decode(listPage.data, 'gbk');
    const $ = cheerio.load(listPage.data);
    const list = $('.table1 tbody tr')
        .slice(1)
        .map((_, tr) => {
            tr = $(tr);

            return {
                title: tr.find('td[title]').attr('title'),
                link: baseUrl + tr.find('td[title] > a').attr('href'),
                author: tr.find('td:last').text(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const postPage = await got(item.link, {
                    responseType: 'buffer',
                });
                postPage.data = iconv.decode(postPage.data, 'gbk');
                const $ = cheerio.load(postPage.data);

                const data = {
                    title: item.title,
                    description: $('.letter-details').html().trim(),
                    pubDate: parseDate($('.letter-details div:first table tr:nth-child(2) > .td_label2').text() + ' +0800', 'YYYY-MM-DD HH:mm:ss ZZ'),
                    link: item.link,
                    author: item.author,
                };
                return data;
            })
        )
    );

    ctx.state.data = {
        title: '来信反馈 - 长沙市市长信箱',
        link: `${baseUrl}/webapp/cs2020/email/index.jsp`,
        item: items,
    };
};
