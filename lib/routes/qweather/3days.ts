// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { config } from '@/config';

const WEATHER_API = 'https://devapi.qweather.com/v7/weather/3d';
const AIR_QUALITY_API = 'https://devapi.qweather.com/v7/air/5d';
const CIRY_LOOKUP_API = 'https://geoapi.qweather.com/v2/city/lookup';
const author = 'QWeather';

export default async (ctx) => {
    if (!config.hefeng.key) {
        throw new Error('QWeather RSS is disabled due to the lack of <a href="https://docs.rsshub.app/zh/install/config#%E5%92%8C%E9%A3%8E%E5%A4%A9%E6%B0%94">relevant config</a>');
    }
    const id = await cache.tryGet(ctx.req.param('location') + '_id', async () => {
        const response = await got(`${CIRY_LOOKUP_API}?location=${ctx.req.param('location')}&key=${config.hefeng.key}`);
        return response.data.location[0].id;
    });
    const weatherData = await cache.tryGet(
        ctx.req.param('location'),
        async () => {
            const response = await got(`${WEATHER_API}?key=${config.hefeng.key}&location=${id}`);
            return response.data;
        },
        config.cache.contentExpire,
        false
    );
    const airQualityData = await cache.tryGet(
        `qweather:air:${ctx.req.param('location')}`,
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
        guid: '位置：' + ctx.req.param('location') + '--日期：' + item.fxDate,
        link: combined.fxLink,
        author,
    }));

    ctx.set('data', {
        title: ctx.req.param('location') + '未来三天天气',
        description: ctx.req.param('location') + '未来三天天气情况，使用和风彩云 API (包括空气质量)',
        item: items,
        link: combined.fxLink,
        author,
    });
};
