const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootURL = 'https://ctt.swjtu.edu.cn';
const url_addr = `${rootURL}/yethan/WebIndexAction?setAction=newsList&bigTypeId=0E4BF4D36E232918`;

module.exports = async (ctx) => {
    const resp = await got({
        method: 'get',
        url: url_addr,
    });

    const $ = cheerio.load(resp.data);
    const list = $("[class='news-list flex']");

    ctx.state.data = {
        title: '西南交大交运学院-研究生通知',
        link: url_addr,
        item:
            list &&
            list.toArray().map((i) => {
                const item = $(i);
                const news_info = item.find('div[class="news-title newsInfo"]');
                const news_month = item.find('.month');
                const news_day = item.find('.day');
                return {
                    title: `标题：${news_info.text()}`,
                    pubDate: parseDate(`${news_month.text()}.${news_day.text()}`),
                    link: `${rootURL}/yethan/WebIndexAction?setAction=newsInfo&newsId=${news_info.attr('newsid')}`,
                };
            }),
        allowEmpty: true,
    };
};
