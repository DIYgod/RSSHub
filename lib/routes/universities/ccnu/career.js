const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'http://career.ccnu.edu.cn';
    const targetSel = "a[href^='/Schedule/ScheduleDetail/'], a[href^='/Schedule/ZWSSHDetail/']";

    const response = await got(host);

    const $ = cheerio.load(response.data);
    const list = $(targetSel);

    const items =
        list &&
        list
            .map((index, item) => {
                item = $(item);

                const title = item.attr('title') || item.find('font').text();

                const timeELe = item.find('span');

                // 照顾周五双选会的时间
                let time = timeELe.children().length === 2 ? timeELe.text().trim().slice(2) + '/' + timeELe.text().trim().slice(0, 2) : timeELe.text();

                time = new Date(`${time.replace(/\//g, '-')}T00:00+08:00`);

                return {
                    title,
                    // 今天之后的日期写在 description 中，pubDate 写今天
                    description: `${time.toLocaleDateString('zh-CN')} - ${title}`,
                    pubDate: time > new Date() ? new Date(new Date().setHours(0, 0, 0, 0)).toUTCString() : time.toUTCString(),
                    link: `${host}${item.attr('href')}`,
                };
            })
            .get();

    ctx.state.data = {
        title: '华中师范大学就业信息',
        link: host,
        item: items,
    };
};
