const got = require('@/utils/got'); // 自订的 got
const cheerio = require('cheerio'); // 可以使用类似 jQuery 的 API HTML 解析器
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://jwc.ncu.edu.cn';
    const response = await got(baseUrl);
    const $ = cheerio.load(response.body);

    const list = $('.box3 .inner ul.img-list li');

    ctx.state.data = {
        title: '南昌大学教务处',
        link: baseUrl,
        description: '南昌大学教务处',
        item:
            list &&
            list.toArray().map((item) => {
                const el = $(item);
                const linkEl = el.find('a');
                const date = el.text().split('】')[0].replace('【', '').trim();
                const title = linkEl.attr('title');
                const link = `${baseUrl}/${linkEl.attr('href')}`;
                const month = date.slice(0, 2);

                return {
                    title,
                    link,
                    pubDate: parseDate(date, 'MM-DD').setFullYear(month < 6 ? new Date().getFullYear() - 1 : new Date().getFullYear()),
                };
            }),
    };
};
