const got = require('@/utils/got');
const cheerio = require('cheerio');
const host = 'http://career.ccnu.edu.cn';

const scheduleCatPrefix = 'ScheduleCategory?type=';

const schedules = ['校内专场', '校外专场', '大型招聘会', '综合信息'].map((x) => new Map([['type', x], ['suffix', `${scheduleCatPrefix}${encodeURIComponent(x)}`]]));
const zwssh = new Map([['type', '周五双选会'], ['suffix', 'ZWSSHList']]);
schedules.push(zwssh);

module.exports = async (ctx) => {
    const id = Number.parseInt(ctx.params.type);
    const urlSuffix = schedules[id].get('suffix');
    const response = await got({
        method: 'get',
        url: `${host}/Schedule/${urlSuffix}`,
    });

    const $ = cheerio.load(response.data);
    const list = $('ul.nlist li');

    const items =
        list &&
        list
            .map((index, item) => {
                item = $(item);
                return {
                    title: item.find('a').text(),
                    pubDate: new Date(item.find('span').text()).toUTCString(),
                    link: `${host}${item
                        .find('a')
                        .eq(0)
                        .attr('href')}`,
                };
            })
            .get();

    ctx.state.data = {
        title: '华中师范大学就业信息',
        link: host,
        item: items,
    };
};
