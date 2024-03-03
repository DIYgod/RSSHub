// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? '0';
    const select = ctx.req.param('select') ?? '全部函件类别';
    const keyword = ctx.req.param('keyword') ?? '';

    const rootUrl = 'https://www.szse.cn';
    const currentUrl = `${rootUrl}/api/report/ShowReport/data?SHOWTYPE=JSON&CATALOGID=main_wxhj&TABKEY=tab${Number.parseInt(category) + 2}${select === '全部函件类别' ? '' : `&selecthjlb=${select}`}${keyword ? `&txtZqdm=${keyword}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const data = response.data[category];

    const items = data.data.map((item) => {
        item.ck = item.ck.match(/encode-open='\/(.*)'>详细内容/)[1];
        item.hfck = item.hfck.replace(/encode-open='\//, "encode-open='http://reportdocs.static.szse.cn/");

        return {
            title: `[${item.gsdm}] ${item.gsjc} (${item.hjlb})`,
            link: `http://reportdocs.static.szse.cn/${item.ck}`,
            pubDate: parseDate(item.fhrq),
            description: art(path.join(__dirname, 'templates/inquire.art'), {
                item,
            }),
        };
    });

    ctx.set('data', {
        title: `深圳证券交易所 - 问询函件 - ${data.metadata.name}`,
        link: `${rootUrl}/disclosure/supervision/inquire/index.html`,
        item: items,
        description: `函件类别：${select}${keyword ? `; 公司代码或简称：${keyword}` : ''}`,
    });
};
