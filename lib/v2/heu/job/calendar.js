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

    const response = await got({
        method: 'post',
        url: 'http://job.hrbeu.edu.cn/HrbeuJY/Web/Employ/QueryCalendar',
        json: {
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

    const todayResponse = await got({
        method: 'get',
        url: rootUrl.concat(link),
    });

    const $ = cheerio.load(todayResponse.data);

    const list = $('li.clearfix')
        .map((_, item) => {
            const link = $(item).find('span.news_tit.news_tit_s').find('a').attr('href');
            return {
                title: $(item).find('span.news_tit.news_tit_s').find('a').attr('title'),
                description: $(item).find('span.news_tit.news_tit_s').find('a').attr('title') + '<br><br>' + '点击标题，登录查看招聘详情',
                link,
            };
        })
        .get();

    ctx.state.data = {
        title: '今日招聘会',
        link: 'http://job.hrbeu.edu.cn/HrbeuJY/web',
        item: list,
        allowEmpty: true,
    };
};
