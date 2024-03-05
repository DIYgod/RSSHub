// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import * as path from 'node:path';
import { art } from '@/utils/render';

const bootstrapHost = 'https://weixin.shmtu.edu.cn/dynamic/shmtuHttps';
const host = 'https://portal.shmtu.edu.cn/api';

const loadDetail = async (link) => {
    const response = await got.post(bootstrapHost, {
        form: {
            interfaceUrl: link,
        },
        https: { rejectUnauthorized: false },
    });

    return JSON.parse(response.data);
};

const processFeed = (list, caches) =>
    Promise.all(
        list.map((item) =>
            caches.tryGet(item.link, async () => {
                const detail = await loadDetail(item.link);
                const files = detail.field_file;
                const images = detail.field_image;
                item.description = art(path.join(__dirname, 'templates/portal.art'), {
                    body: detail.body.und[0].safe_value,
                    images: images.length !== 0 && Object.keys(images).length !== 0 ? images.und : null,
                    files: files.length !== 0 && Object.keys(files).length !== 0 ? files.und : null,
                });
                item.link = detail.path;
                return item;
            })
        )
    );

export default async (ctx) => {
    const type = ctx.req.param('type');
    let info;
    switch (type) {
        case 'bmtzgg':
            info = '部门通知公告';
            break;
        case 'xsydxhdgg':
            info = '学术与大型活动公告';
            break;
        case 'bmdt':
            info = '部门动态';
            break;
        default:
            info = '未知';
            break;
    }

    const response = await got.post(bootstrapHost, {
        form: {
            interfaceUrl: `${host}/${type}.json?page=0`,
        },
        https: { rejectUnauthorized: false },
    });

    const list = JSON.parse(response.data).map((item) => ({
        title: load(item.title).text(),
        link: `${host}/node/${item.nid}.json`,
        pubDate: timezone(parseDate(item.created), 8),
        category: item.field_department[0],
        author: item.field_department[0],
    }));

    const result = await processFeed(list, cache);

    ctx.set('data', {
        title: `上海海事大学 ${info}`,
        link: 'https://portal.shmtu.edu.cn/bumentongzhigonggao',
        description: '上海海事大学 数字平台',
        item: result,
    });
};
