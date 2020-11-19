const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'http://cltt.51hzks.cn/queryExamInfo';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    const title = [];
    const items = [];
    $('.pth_smrtable')
        .find('th')
        .each((i, e) => {
            const titleStr = $(e).text().replace(/\n/g, '').replace(/\t/g, '');
            title.push(titleStr);
        });

    $('.pth_smrtable')
        .find('tr')
        .slice(1)
        .each((i, e) => {
            let examInfo = '';
            $(e)
                .find('td')
                .each((i, e) => {
                    const titleStr = $(e).text().trim().replace(/\n/g, '').replace(/\t/g, '');
                    examInfo += `${title[i]}: ${titleStr} `;
                });
            items.push({ description: examInfo });
        });

    ctx.state.data = {
        title: `近期杭州市普通话测试网报时间及考试地点公布`,
        link: rootUrl,
        item: items,
    };
};
