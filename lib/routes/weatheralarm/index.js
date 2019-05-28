const axios = require('@/utils/axios');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const alarmInfoURL = 'http://www.nmc.cn/f/alarm.html';
    const html = (await axios.get(alarmInfoURL)).data;
    const $ = cheerio.load(html);
    const alarmElements = $('.alarmlist > div:not(.pagination)').toArray();

    ctx.state.data = {
        title: '中央气象台全国气象预警',
        link: alarmInfoURL,
        item: alarmElements.map((el) => {
            const $el = $(el);
            const $aEl = $el.find('a');
            return {
                title: $aEl.text(),
                link: `http://www.nmc.cn${$aEl.attr('href')}`,
                pubDate: date($el.find('.date').text(), 8),
            };
        }),
    };
};
