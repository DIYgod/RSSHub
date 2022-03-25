const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const locationUtil = require('./util/location');
const config = require('@/config').value;
const rootUrl = 'https://devapi.qweather.com/v7/weather/3d?';

module.exports = async (ctx) => {
    let id = await ctx.cache.get(ctx.params.location + '_id');
    if (!id) {
        id = await locationUtil.getLocationID(ctx, ctx.params.location);
        ctx.cache.set(ctx.params.location + '_id', id);
    }
    const requestUrl = rootUrl + 'key=' + config.hefeng.key + '&location=' + id;
    let response = await ctx.cache.get(ctx.params.location);
    if (!response) {
        response = await got.get(requestUrl);
        ctx.cache.set(ctx.params.location);
    }
    const rawdata = response.data;
    const data = [];
    for (const i in rawdata.daily) {
        data.push(rawdata.daily[i]);
    }
    const items = data.map((item) => ({
        title: '预报日期：' + item.fxDate,
        description: art(path.join(__dirname, './util/weather.art'), {
            item,
        }),
    }));

    ctx.state.data = {
        title: ctx.params.location + '未来三天天气',
        item: items,
    };
};
