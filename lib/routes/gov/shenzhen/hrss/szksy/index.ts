import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootURL = 'http://hrss.sz.gov.cn/';

export const route: Route = {
    path: '/shenzhen/hrss/szksy/:caty/:page?',
    categories: ['government'],
    example: '/gov/shenzhen/hrss/szksy/bmxx/2',
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
            source: ['xxgk.sz.gov.cn/cn/xxgk/zfxxgj/:caty'],
        },
    ],
    name: '深圳市考试院',
    maintainers: ['zlasd'],
    handler,
    url: 'hrss.sz.gov.cn/*',
    description: `| 通知公告 | 报名信息 | 成绩信息 | 合格标准 | 合格人员公示 | 证书发放信息 |
  | :------: | :------: | :------: | :------: | :----------: | :----------: |
  |   tzgg   |   bmxx   |   cjxx   |   hgbz   |    hgrygs    |     zsff     |`,
};

async function handler(ctx) {
    const categoryID = ctx.req.param('caty');
    const page = ctx.req.param('page') ?? '1';

    const pageParam = Number.parseInt(page) > 1 ? `_${page}` : '';
    const pagePath = `/szksy/zwgk/${categoryID}/index${pageParam}.html`;

    const currentURL = new URL(pagePath, rootURL); // do not use deprecated 'url.resolve'
    const response = await got({ method: 'get', url: currentURL });
    if (response.statusCode !== 200) {
        throw new Error(response.statusMessage);
    }

    const $ = load(response.data);
    const title = $('.zx_rm_tit span').text().trim();
    const list = $('.zx_ml_list ul li')
        .slice(1)
        .map((_, item) => {
            const tag = $(item).find('div.list_name a');
            const tag2 = $(item).find('span:eq(1)');
            return {
                title: tag.text().trim(),
                link: tag.attr('href'),
                pubDate: timezone(parseDate(tag2.text().trim(), 'YYYY/MM/DD'), 0),
            };
        })
        .get();

    return {
        title: '深圳市考试院 - ' + title,
        link: currentURL.href,
        item: list,
    };
}
