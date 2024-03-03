// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('column');
    const limit = isNaN(Number.parseInt(ctx.req.query('limit'))) ? 25 : Number.parseInt(ctx.req.query('limit'));

    const response = await got({
        method: 'get',
        url: `https://api.cntv.cn/NewVideo/getVideoListByColumn?id=${id}&n=${limit}&sort=desc&p=1&mode=0&serviceId=tvcctv`,
    });
    const data = response.data.data.list;
    const name = data[0].title.match(/《(.*?)》/)[1];

    ctx.set('data', {
        title: `CNTV 栏目 - ${name}`,
        description: `${name} 栏目的视频更新`,
        item: data.map((item) => ({
            title: item.title,
            description: art(path.join(__dirname, 'templates/column.art'), {
                item,
            }),
            pubDate: parseDate(item.time),
            link: item.url,
        })),
    });
};
