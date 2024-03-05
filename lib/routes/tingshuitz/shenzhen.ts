// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const url = 'https://szgk.sz-water.com.cn/api/wechat/op/getStopWaterNotice';
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data.data;

    ctx.set('data', {
        title: '停水通知 - 深圳水务',
        link: 'https://www.sz-water.com.cn/',
        item: data.map((item) => ({
            title: `${item.position}${item.stoptime}`,
            description: art(path.join(__dirname, 'templates/shenzhen.art'), {
                item,
            }),
            pubDate: timezone(parseDate(item.createdOn, 'YYYY-MM-DD HH:mm:ss'), +8),
            link: 'https://szgk.sz-water.com.cn/wechat_web/Water_stop.html',
            guid: `${item.position}${item.stopStartTime}`,
        })),
    });
};
