import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootURL = 'http://www.zzb.sz.gov.cn/';

export const route: Route = {
    path: '/shenzhen/zzb/:caty/:page?',
    categories: ['government'],
    example: '/gov/shenzhen/zzb/tzgg',
    parameters: { caty: '信息类别', page: '页码' },
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
            source: ['zzb.sz.gov.cn/*'],
        },
    ],
    name: '深圳市委组织部',
    maintainers: ['zlasd'],
    handler,
    url: 'zzb.sz.gov.cn/*',
    description: `| 通知公告 | 任前公示 | 政策法规 | 工作动态 | 部门预算决算公开 | 业务表格下载 |
| :------: | :------: | :------: | :------: | :--------------: | :----------: |
|   tzgg   |   rqgs   |   zcfg   |   gzdt   |       xcbd       |     bgxz     |`,
};

async function handler(ctx) {
    const categoryID = ctx.req.param('caty');
    const page = ctx.req.param('page') ?? '1';

    const pageParam = Number.parseInt(page) > 1 ? `_${page}` : '';
    const pagePath = `/${categoryID}/index${pageParam}.html`;

    const currentURL = new URL(pagePath, rootURL); // do not use deprecated 'url.resolve'
    const response = await got({ method: 'get', url: currentURL });
    if (response.statusCode !== 200) {
        throw new Error(response.statusMessage);
    }

    const $ = load(response.data);
    const title = $('#Title').text().trim();
    const list = $('#List tbody tr td table tbody tr td[width="96%"]')
        .toArray()
        .map((item) => {
            const tag = $(item).find('font a');
            const tag2 = $(item).find('font[size="2px"]');
            return {
                title: tag.text(),
                link: tag.attr('href'),
                pubDate: timezone(parseDate(tag2.text().trim(), 'YYYY/MM/DD'), 0),
            };
        });

    return {
        title: '深圳组工在线 - ' + title,
        link: currentURL.href,
        item: list,
    };
}
