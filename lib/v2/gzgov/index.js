const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'http://gz.gov.cn';

const categoryMap = {
    gzyw: '广州要闻',
    jrtt: '今日头条',
    tzgg: '通知公告',
    zcjd: '政策解读',
};

const urlMap = {
    gzyw: 'gzyw',
    jrtt: 'jrtt',
    tzgg: 'tzgg',
    zcjd: 'zcjd/zcjd',
};

module.exports = async (ctx) => {
    const channel = ctx.params.channel;
    const category = ctx.params.category;
    const url = `${rootUrl}/${channel}/${urlMap[category]}/`;
    const response = await got(url);
    const $ = cheerio.load(response.data);

    const items = $('.news_list li')
        .toArray()
        .map((item) => {
            item = $(item);
            const href = item.find('a').attr('href');
            return {
                title: item.find('a').attr('title'),
                link: href,
                pubDate: parseDate(item.find('span').text()),
            };
        });

    ctx.state.data = {
        title: `广州市人民政府 - ${categoryMap[category]}`,
        link: url,
        item: items,
    };
};
