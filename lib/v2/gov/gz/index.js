const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://www.gz.gov.cn';

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
        title: `广州市人民政府 - ${$('.main_title').text()}`,
        link: url,
        item: items,
    };
};
