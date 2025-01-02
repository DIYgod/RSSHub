import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

const WEATHER_API = 'https://devapi.qweather.com/v7/weather/3d';
const AIR_QUALITY_API = 'https://devapi.qweather.com/v7/air/5d';
const CIRY_LOOKUP_API = 'https://geoapi.qweather.com/v2/city/lookup';
const author = 'QWeather';

export const route: Route = {
    path: '/3days/:location',
    categories: ['forecast'],
    example: '/qweather/3days/广州',
    parameters: { location: 'N' },
    features: {
        requireConfig: [
            {
                name: 'HEFENG_KEY',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '近三天天气',
    maintainers: ['Rein-Ou', 'la3rence'],
    handler,
    description: '获取订阅近三天天气预报',
};

async function handler(ctx) {
    if (!config.hefeng.key) {
        throw new ConfigNotFoundError('QWeather RSS is disabled due to the lack of <a href="https://docs.rsshub.app/zh/install/config#%E5%92%8C%E9%A3%8E%E5%A4%A9%E6%B0%94">relevant config</a>');
    }

    const id = await cache.tryGet('qweather:' + ctx.req.param('location') + ':id', async () => {
        const response = await got(`${CIRY_LOOKUP_API}?location=${ctx.req.param('location')}&key=${config.hefeng.key}`);
        return response.data.location[0].id;
    });
    const weatherData = await cache.tryGet(
        'qweather:' + ctx.req.param('location'),
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

    return {
        title: ctx.req.param('location') + '未来三天天气',
        description: ctx.req.param('location') + '未来三天天气情况，使用和风彩云 API (包括空气质量)',
        item: items,
        link: combined.fxLink,
        author,
    };
}
