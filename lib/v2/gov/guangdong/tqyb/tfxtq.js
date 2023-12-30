const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'http://www.tqyb.com.cn';

module.exports = async (ctx) => {
    const tfxtqJsUrl = `${rootUrl}/data/gzWeather/weatherTips.js`;

    const response = await got.get(tfxtqJsUrl);
    const data = JSON.parse(`[{${response.data.match(/Tips = {(.*?)}/)[1]}}]`);

    const items = data.map((item) => ({
        title: item.title,
        link: 'http://www.tqyb.com.cn/gz/weatherAlarm/suddenWeather/',
        author: item.issuer,
        description: art(path.join(__dirname, './templates/tfxtq.art'), {
            content: item.content,
        }),
        pubDate: parseDate(item.ddate),
        guid: parseDate(item.ddate) + item.title,
    }));

    ctx.state.data = {
        title: '突发性天气提示',
        link: 'http://www.tqyb.com.cn/gz/weatherAlarm/suddenWeather/',
        item: items,
    };
};
