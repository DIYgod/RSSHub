const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const config = require('@/config').value;

const WEATHER_API = 'https://devapi.qweather.com/v7/weather/3d';
const AIR_QUALITY_API = 'https://devapi.qweather.com/v7/air/5d';
const CIRY_LOOKUP_API = 'https://geoapi.qweather.com/v2/city/lookup';
const author = 'QWeather';

module.exports = async (ctx) => {
    if (!config.hefeng.key) {
        throw Error('QWeather RSS is disabled due to the lack of <a href="https://docs.rsshub.app/zh/install/config#%E5%92%8C%E9%A3%8E%E5%A4%A9%E6%B0%94">relevant config</a>');
    }
    const id = await ctx.cache.tryGet(ctx.params.location + '_id', async () => {
        const response = await got(`${CIRY_LOOKUP_API}?location=${ctx.params.location}&key=${config.hefeng.key}`);
        return response.data.location[0].id;
    });
    const weatherData = await ctx.cache.tryGet(
        ctx.params.location,
        async () => {
            const response = await got(`${WEATHER_API}?key=${config.hefeng.key}&location=${id}`);
            return response.data;
        },
        config.cache.contentExpire,
        false
    );
    const airQualityData = await ctx.cache.tryGet(
        `qweather:air:${ctx.params.location}`,
        async () => {
            const airQualityResponse = await got(`${AIR_QUALITY_API}?location=${id}&key=${config.hefeng.key}`);
            return airQualityResponse.data;
        },
        config.cache.contentExpire,
        false
    );
    // merge weather data with air quality data
    const combined = {
        updateTime: weatherData.updateTime,
        fxLink: weatherData.fxLink,
        daily: weatherData.daily.map((weatherItem) => {
            const dailyAirQuality = airQualityData.daily.find((airQualityItem) => airQualityItem.fxDate === weatherItem.fxDate);
            if (dailyAirQuality) {
                return {
                    ...weatherItem,
                    aqi: dailyAirQuality.aqi,
                    aqiLevel: dailyAirQuality.level,
                    aqiCategory: dailyAirQuality.category,
                    aqiPrimary: dailyAirQuality.primary,
                };
            }
            return weatherItem;
        }),
    };
    const items = combined.daily.map((item) => ({
        title: `${item.fxDate}: ${item.textDay === item.textNight ? item.textDay : item.textDay + '转' + item.textNight} ${item.tempMin}~${item.tempMax}℃`,
        description: art(path.join(__dirname, 'templates/3days.art'), {
            item,
        }),
        pubDate: combined.updateTime,
        guid: '位置：' + ctx.params.location + '--日期：' + item.fxDate,
        link: combined.fxLink,
        author,
    }));

    ctx.state.data = {
        title: ctx.params.location + '未来三天天气',
        description: ctx.params.location + '未来三天天气情况，使用和风彩云 API (包括空气质量)',
        item: items,
        link: combined.fxLink,
        author,
    };
};
