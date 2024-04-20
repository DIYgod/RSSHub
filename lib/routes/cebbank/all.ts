import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import md5 from '@/utils/md5';

export const route: Route = {
    path: '/quotation/all',
    categories: ['other'],
    example: '/cebbank/quotation/all',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['cebbank.com/site/ygzx/whpj/index.html', 'cebbank.com/eportal/ui', 'cebbank.com/'],
        },
    ],
    name: 'Unknown',
    maintainers: ['linbuxiao'],
    handler,
    url: 'cebbank.com/site/ygzx/whpj/index.html',
};

async function handler(ctx) {
    const link = 'https://www.cebbank.com/eportal/ui?pageId=477257';
    const content = await got({
        method: 'get',
        url: link,
    });

    const $ = load(content.data);

    const items = $('.lczj_box tbody tr')
        .map((i, e) => {
            if (i < 2) {
                return null;
            }
            const c = load(e, { decodeEntities: false });
            return {
                title: c('td:nth-child(1)').text(),
                description: art(path.join(__dirname, 'templates/allDes.art'), {
                    fcer: c('td:nth-child(2)').text(),
                    pmc: c('td:nth-child(3)').text(),
                    exrt: c('td:nth-child(4)').text(),
                    mc: c('td:nth-child(5)').text(),
                }),
                pubDate: timezone(parseDate($('#t_id span').text().substring(5), 'YYYY-MM-DD HH:mm', true), 8),
                guid: md5(c('td:nth-child(1)').text() + $('#t_id span').text().substring(5)),
            };
        })
        .get();

    const ret = {
        title: '中国光大银行',
        description: '中国光大银行 外汇牌价',
        link,
        item: items,
    };

    ctx.set('json', {
        ...ret,
        pubDate: timezone(parseDate($('#t_id span').text().substring(5), 'YYYY-MM-DD HH:mm', true), 0),
    });
    return ret;
}
