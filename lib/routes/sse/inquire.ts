// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const refererUrl = 'https://www.sse.com.cn/disclosure/credibility/supervision/inquiries/';
    const response = await got('https://query.sse.com.cn/commonSoaQuery.do', {
        searchParams: {
            isPagination: true,
            'pageHelp.pageSize': 25,
            'pageHelp.pageNo': 1,
            'pageHelp.beginPage': 1,
            'pageHelp.cacheSize': 1,
            'pageHelp.endPage': 1,
            sqlId: 'BS_KCB_GGLL',
            siteId: 28,
            channelId: '10743,10744,10012',
            type: '',
            stockcode: '',
            extWTFL: '',
            order: 'createTime|desc,stockcode|asc',
            _: Date.now(),
        },
        headers: {
            Referer: refererUrl,
        },
    });

    const items = response.data.result.map((item) => ({
        title: item.extGSJC,
        description: art(path.resolve(__dirname, 'templates/inquire.art'), {
            item,
        }),
        pubDate: parseDate(item.createTime),
        link: `https://${item.docURL}`,
        author: item.extGSJC,
    }));

    ctx.set('data', {
        title: '上海证券交易所 - 科创板股票审核',
        link: refererUrl,
        item: items,
    });
};
