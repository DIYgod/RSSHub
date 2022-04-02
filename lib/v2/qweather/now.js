const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const config = require('@/config').value;
const rootUrl = 'https://devapi.qweather.com/v7/weather/now?';
module.exports = async (ctx) => {
    const id = await ctx.cache.tryGet(ctx.params.location + '_id', async () => {
        const response = await got(`https://geoapi.qweather.com/v2/city/lookup?location=${ctx.params.location}&key=${config.hefeng.key}`);
        const data = [];
        for (const i in response.data.location) {
            data.push(response.data.location[i]);
        }
        return data[0].id;
    });
    const requestUrl = rootUrl + 'key=' + config.hefeng.key + '&location=' + id;
    const responseData = await ctx.cache.tryGet(
        ctx.params.location + '_now',
        async () => {
            const response = await got(requestUrl);
            return response.data;
        },
        3600, // second
        false
    );

    const data = [responseData.now];

    const timeObj = timezone(parseDate(responseData.updateTime), +8);

    const time_show = timeObj.toLocaleString();

    ctx.state.data = {
        title: ctx.params.location + '实时天气',
        description: ctx.params.location + '实时天气状况',
        item: data.map((item) => ({
            title: '观测时间：' + time_show,
            description: art(path.join(__dirname, './util/now.art'), { item }),
            pubDate: timeObj,
            guid: '位置:' + ctx.params.location + '--时间：' + time_show,
            link: responseData.fxLink,
        })),
        link: responseData.fxLink,
    };
};
