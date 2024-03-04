// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
const { parseArticle } = require('./utils');
import * as path from 'node:path';

export default async (ctx) => {
    const reporterId = ctx.req.param('reporter');
    const currentUrl = `https://api.nfapp.southcn.com/nanfang_if/reporter/list?reporterUuid=${reporterId}&pageSize=20&pageNo=1&origin=0`;

    const { data: response } = await got(currentUrl);

    const list = response.data.reportInfo.articleInfo.map((item) => ({
        title: '【' + item.releaseColName + '】' + item.title,
        description: art(path.join(__dirname, '../templates/description.art'), {
            thumb: item.picMiddle,
            description: item.attAbstract,
        }),
        pubDate: timezone(parseDate(item.publishtime), +8),
        link: `http://pc.nfapp.southcn.com/${item.colID}/${item.fileId}.html`,
        articleId: item.fileId,
        shareUrl: item.shareUrl,
    }));

    const items = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    ctx.set('data', {
        title: `南方+ - ${response.data.reportInfo.reporterName}`,
        link: `https://static.nfapp.southcn.com/apptpl/reporterWorksList/index.html?reporterUuid=${reporterId}`,
        item: items,
    });
};
