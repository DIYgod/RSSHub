// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
const rootUrl = 'https://devapi.qweather.com/v7/weather/now?';
export default async (ctx) => {
    const id = await cache.tryGet(ctx.req.param('location') + '_id', async () => {
        const response = await got(`https://geoapi.qweather.com/v2/city/lookup?location=${ctx.req.param('location')}&key=${config.hefeng.key}`);
        const data = [];
        for (const i in response.data.location) {
            data.push(response.data.location[i]);
        }
        return data[0].id;
    });
    const requestUrl = rootUrl + 'key=' + config.hefeng.key + '&location=' + id;
    const responseData = await cache.tryGet(
        ctx.req.param('location') + '_now',
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

    ctx.set('data', {
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
    });
};
