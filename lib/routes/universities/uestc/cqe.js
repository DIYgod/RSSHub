const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootlink = 'http://cqe.uestc.edu.cn/';
const mapUrl = {
    hdyg: 'xwgg/hdyg.htm',
    tz: 'xwgg/tzgg.htm',
    kctz: 'kcjs/tzgg.htm',
    lrxb: 'ldljy/tzgg.htm',
};

const mapTitle = {
    hdyg: '成电文化素质教育中心-活动预告',
    tz: '成电文化素质教育中心-通知',
    kctz: '成电文化素质教育中心-课程通知',
    lrxb: '立人班选拔',
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'hdyg';
    const response = await got({
        method: 'get',
        url: rootlink + mapUrl[type],
    });

    const data = response.data;
    const $ = cheerio.load(data);

    ctx.state.data = {
        title: mapTitle[type],
        link: rootlink + mapUrl[type],
        item: $('div.Newslist>ul>li')
            .map((_, item) => ({
                title: $(item).find('a').attr('title'),
                link: $(item).find('a').attr('href').replace('..', rootlink),
                pubDate: $(item).find('span').text().substr(1, 10),
            }))
            .get(),
    };
};
