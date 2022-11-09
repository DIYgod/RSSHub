const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'http://job.hrbeu.edu.cn';

module.exports = async (ctx) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    let strmMonth;
    month < 10 ? (strmMonth = '0' + month) : (strmMonth = month);
    const day = date.getDate();

    const response = await got('http://job.hrbeu.edu.cn/HrbeuJY/Web/Employ/QueryCalendar', {
        searchParams: {
            yearMonth: year + '-' + strmMonth,
        },
    }).json();

    let link = '';
    for (let i = 0, l = response.length; i < l; i++) {
        // if (response[i].day === Number('10')) {
        if (response[i].day === Number(day)) {
            link = response[i].Items[0].link;
        }
    }

    const todayResponse = await got(`${rootUrl}${link}`);

    const $ = cheerio.load(todayResponse.data);

    const list = $('li.clearfix')
        .map((_, item) => ({
            title: $(item).find('span.news_tit.news_tit_s').find('a').attr('title'),
            description: '点击标题，登录查看招聘详情',
            link: $(item).find('span.news_tit.news_tit_s').find('a').attr('href'),
        }))
        .get();

    ctx.state.data = {
        title: '今日招聘会',
        link: 'http://job.hrbeu.edu.cn/HrbeuJY/web',
        item: list,
        allowEmpty: true,
    };
};
