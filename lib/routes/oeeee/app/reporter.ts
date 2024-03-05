// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
const { parseArticle } = require('../utils');
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const id = ctx.req.param('id') ?? 0;
    const currentUrl = `https://m.mp.oeeee.com/show.php?m=Doc&a=getAuthorInfo&id=${id}`;

    const { data: response } = await got(currentUrl);

    const list = response.data.list.map((item) => ({
        title: '【' + item.media_nickname + '】' + item.title,
        description: art(path.join(__dirname, '../templates/description.art'), {
            thumb: item.titleimg,
            description: item.summary,
        }),
        link: item.url,
    }));

    const author = response.data.info ? response.data.info.name : '';

    const items = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    ctx.set('data', {
        title: `南方都市报奥一网 - ${author}`,
        link: `https://m.mp.oeeee.com/w/${id}.html`,
        item: items,
    });
};
