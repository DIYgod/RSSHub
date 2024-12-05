import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

const rootUrl = 'https://devapi.qweather.com/v7/weather/now?';

export const route: Route = {
    path: '/now/:location',
    categories: ['forecast'],
    example: '/qweather/now/广州',
    parameters: { location: 'N' },
    features: {
        requireConfig: [
            {
                name: 'HEFENG_KEY',
                description: '访问 `https://www.qweather.com/` 注册开发 API Key。',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '实时天气',
    maintainers: ['Rein-Ou'],
    handler,
};

async function handler(ctx) {
    if (!config.hefeng.key) {
        throw new ConfigNotFoundError('QWeather RSS is disabled due to the lack of <a href="https://docs.rsshub.app/zh/install/config#%E5%92%8C%E9%A3%8E%E5%A4%A9%E6%B0%94">relevant config</a>');
    }

    const id = await cache.tryGet('qweather:' + ctx.req.param('location') + ':id', async () => {
        const response = await got(`https://geoapi.qweather.com/v2/city/lookup?location=${ctx.req.param('location')}&key=${config.hefeng.key}`);
        const data = response.data.location.map((loc) => loc);
        return data[0].id;
    });
    const requestUrl = rootUrl + 'key=' + config.hefeng.key + '&location=' + id;
    const responseData = await cache.tryGet(
        'qweather:' + ctx.req.param('location') + ':now',
        async () => {
            const response = await got(requestUrl);
            return response.data;
        },
        3600, // second
        false
    );

    const data = [responseData.now];

    const timeObj = parseDate(responseData.updateTime);

    const time_show = timeObj.toLocaleString();

    return {
        title: ctx.req.param('location') + '实时天气',
        description: ctx.req.param('location') + '实时天气状况',
        item: data.map((item) => ({
            title: '观测时间：' + time_show,
            description: art(path.join(__dirname, 'templates/now.art'), { item }),
            pubDate: timeObj,
            guid: '位置:' + ctx.req.param('location') + '--时间：' + time_show,
            link: responseData.fxLink,
        })),
        link: responseData.fxLink,
    };
}
