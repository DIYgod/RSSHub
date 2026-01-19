import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import md5 from '@/utils/md5';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
        .toArray()
        .map((e, i) => {
            if (i < 2) {
                return null;
            }
            const c = load(e, { decodeEntities: false });
            return {
                title: c('td:nth-child(1)').text(),
                description: renderToString(<CebbankRateDescription fcer={c('td:nth-child(2)').text()} pmc={c('td:nth-child(3)').text()} exrt={c('td:nth-child(4)').text()} mc={c('td:nth-child(5)').text()} />),
                pubDate: timezone(parseDate($('#t_id span').text().slice(5), 'YYYY-MM-DD HH:mm', true), 8),
                guid: md5(c('td:nth-child(1)').text() + $('#t_id span').text().slice(5)),
            };
        });

    const ret = {
        title: '中国光大银行',
        description: '中国光大银行 外汇牌价',
        link,
        item: items,
    };

    ctx.set('json', {
        ...ret,
        pubDate: timezone(parseDate($('#t_id span').text().slice(5), 'YYYY-MM-DD HH:mm', true), 0),
    });
    return ret;
}

const CebbankRateDescription = ({ fcer, pmc, exrt, mc }: { fcer: string; pmc: string; exrt: string; mc: string }) => (
    <>
        <p>
            购汇：{fcer}，购钞：{pmc}
        </p>
        <p>
            结汇: {exrt}，结钞：{mc}
        </p>
    </>
);
