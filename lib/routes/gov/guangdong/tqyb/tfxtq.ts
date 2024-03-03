// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'http://www.tqyb.com.cn';

export default async (ctx) => {
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

    ctx.set('data', {
        title: '突发性天气提示',
        link: 'http://www.tqyb.com.cn/gz/weatherAlarm/suddenWeather/',
        item: items,
    });
};
