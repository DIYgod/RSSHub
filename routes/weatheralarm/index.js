const axios = require('../../utils/axios');
const DateTime = require('luxon').DateTime;
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const alarmInfoURL = 'http://www.nmc.cn/f/alarm.html';
    const html = (await axios.get(alarmInfoURL)).data;
    const $ = cheerio.load(html);
    const alarmElements = $('.alarmlist > div:not(.pagination)').toArray();

    ctx.state.data = {
        title: '中央气象台全国气象预警',
        link: alarmInfoURL,
        item: alarmElements.map((el) => {
            const $aEl = $(el).find('a');
            const link = $aEl.attr('href');
            const dateString = link.match(/_(\d{14})\.html/)[1];
            return {
                title: $aEl.text(),
                link: `http://www.nmc.cn${link}`,
                pubDate: DateTime.fromFormat(dateString, 'yyyyMMddhhmmss', { zone: 'utc+8' }).toRFC2822(),
            };
        }),
    };
};
