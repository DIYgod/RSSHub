const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const config = require('@/config').value;
const rootUrl = 'https://devapi.qweather.com/v7/weather/3d?';

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
        ctx.params.location,
        async () => {
            const response = await got(requestUrl);
            return response.data;
        },
        config.cache.contentExpire,
        false
    );
    const data = [];
    for (const i in responseData.daily) {
        data.push(responseData.daily[i]);
    }
    const items = data.map((item) => ({
        title: '预报日期：' + item.fxDate,
        description: art(path.join(__dirname, 'templates/3days.art'), {
            item,
        }),
        pubDate: responseData.updateTime,
        guid: '位置：' + ctx.params.location + '--日期：' + item.fxDate,
        link: responseData.fxLink,
    }));

    ctx.state.data = {
        title: ctx.params.location + '未来三天天气',
        description: ctx.params.location + '未来三天天气情况，使用和风彩云api',
        item: items,
        link: responseData.fxLink,
    };
};
