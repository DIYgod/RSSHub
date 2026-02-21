import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:fSeg/:sSeg/:tSeg?',
    categories: ['government'],
    example: '/jtystHenan/zc/zdgk/zcwj',
    parameters: {
        fSeg: {
            description: '一级路径',
        },
        sSeg: {
            description: '二级路径',
        },
        tSeg: {
            description: '三级路径',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '河南省交通运输厅',
    maintainers: ['OtacodeZ'],
    handler,
    description: `订阅河南省交通运输厅的news_box更新`,
    radar: [
        {
            source: ['jtyst.henan.gov.cn/:fSeg/:sSeg', 'jtyst.henan.gov.cn/:fSeg/:sSeg/tSeg'],
            target: '/:fSeg/:sSeg/:tSeg?',
        },
    ],
};

async function handler(ctx) {
    const fSeg = ctx.req.param('fSeg') ?? '';
    const sSeg = ctx.req.param('sSeg') ?? '';
    const tSeg = ctx.req.param('tSeg') ?? '';

    const rootUrl = 'https://jtyst.henan.gov.cn';
    const fUrl = fSeg === '' ? '' : `/${fSeg}`;
    const sUrl = sSeg === '' ? '' : `/${sSeg}`;
    const tUrl = tSeg === '' ? '' : `/${tSeg}`;

    const currentUrl = `${rootUrl}${fUrl}${sUrl}${tUrl}`;

    const response = await ofetch(currentUrl);
    const $ = load(response);

    const items = $('div.news_box li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                link: a.attr('href') ?? '',
                pubDate: timezone(parseDate(item.find('span').text()), +8),
            };
        });

    return {
        title: `河南省交通运输厅${fUrl}${sUrl}${tUrl}`,
        link: currentUrl,
        item: items,
    };
}
