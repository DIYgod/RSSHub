const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const response = await got(`https://tieba.baidu.com/home/main?un=${uid}`);

    const data = response.data;

    const $ = cheerio.load(data);
    const name = $('span.userinfo_username').text();
    const list = $('div.n_right.clearfix');
    let imgurl;

    ctx.state.data = {
        title: `${name} 的贴吧`,
        link: `https://tieba.baidu.com/home/main?un=${uid}`,
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item).find('.n_contain');
                imgurl = item.find('ul.n_media.clearfix img').attr('original');
                return {
                    title: item.find('div.thread_name a').attr('title'),
                    pubDate: timezone(parseDate(item.parent().find('div .n_post_time').text(), ['YYYY-MM-DD', 'HH:mm']), +8),
                    description: `${item.find('div.n_txt').text()}<br><img src="${imgurl}">`,
                    link: item.find('div.thread_name a').attr('href'),
                };
            }),
    };
};
