const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'http://kjt.sc.gov.cn';
const dateRegex = /\((\d{4})-(\d{2})-(\d{2})\)/;

const map = {
    tz: '/tz/index.jhtml',
    gs: '/gs/index.jhtml',
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'tz';
    const response = await got({
        method: 'get',
        url: baseUrl + map[type],
    });

    const data = response.data;
    const $ = cheerio.load(data);
    ctx.state.data = {
        title: '四川省科学技术厅',
        link: baseUrl,
        item: $('div[class="news_middle_top"]')
            .next('div')
            .children('h2')
            .slice(0, 15)
            .map((_, elem) => ({
                link: baseUrl + $(elem).children('a').attr('href'),
                title: $(elem).children('a').text(),
                pubDate: new Date($(elem).children('span').text().replace(dateRegex, '$1-$2-$3')).toUTCString(),
            }))
            .get(),
    };
};
