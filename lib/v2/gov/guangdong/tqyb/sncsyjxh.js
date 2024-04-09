const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const rootUrl = 'http://www.tqyb.com.cn';

module.exports = async (ctx) => {
    const sncsyjxhJsUrl = `${rootUrl}/data/gzWeather/otherCityAlarm.js`;

    const response = await got.get(sncsyjxhJsUrl);
    const resData = JSON.parse(String(response.data.match(/Alarm = (.*?);/)[1]));

    const data = [];
    for (const i in resData) {
        for (const j in resData[i]) {
            data.push(resData[i][j]);
        }
    }

    const items = data.map((item) => ({
        title: item.cname + ' ' + item.sigtypename,
        link: `http://www.tqyb.com.cn/gz/weatherAlarm/otherCity/`,
        description: art(path.join(__dirname, './templates/sncsyjxh.art'), {
            item,
        }),
        pubDate: timezone(parseDate(item.datetime, 'YYYY年MM月DD日 HH:mm'), +8),
        guid: timezone(parseDate(item.datetime, 'YYYY年MM月DD日 HH:mm'), +8) + item.cname + item.sigtypename,
    }));

    ctx.state.data = {
        title: '广东省内城市预警信号',
        link: `http://www.tqyb.com.cn/gz/weatherAlarm/otherCity/`,
        item: items,
    };
};
