import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/mem/gk/sgcc/:category?',
    categories: ['government'],
    example: '/gov/mem/gk/sgcc/tbzdsgdcbg',
    parameters: { category: '分类，见下表，默认为挂牌督办' },
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
            source: ['www.mem.gov.cn/gk/sgcc/:category'],
            target: '/mem/gk/sgcc/:category',
        },
    ],
    name: '事故及灾害查处',
    maintainers: ['nczitzk'],
    handler,
    description: `| 挂牌督办 | 调查报告   |
| -------- | ---------- |
| sggpdbqk | tbzdsgdcbg |`,
};

async function handler(ctx) {
    const { category = 'sggpdbqk' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'https://www.mem.gov.cn';
    const currentUrl = new URL(`gk/sgcc/${category}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('table.center_main02')
        .find('a[title]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const regExp = new RegExp(String.raw`\/sgcc\/${category}\/\.\.\.`);
            const link = new URL(`${category}/${item.prop('href').replace(/\.\//, '')}`, currentUrl).href.replace(regExp, '');

            return {
                title: item.contents().first().text(),
                link,
                pubDate: parseDate(item.find('span').text()),
                enclosure_url: link,
                enclosure_type: `application/${link.split(/\./).pop()}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.link.endsWith('html')) {
                    const { data: detailResponse } = await got(item.link);

                    const content = load(detailResponse);

                    item.description = content('#content').html();
                }
                return item;
            })
        )
    );

    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), rootUrl).href;

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="ColumnDescription"]').prop('content'),
        language: 'zh',
        image: new URL($('#imag').prop('src'), rootUrl).href,
        icon,
        logo: icon,
        subtitle: $('meta[name="ColumnName"]').prop('content'),
        author: $('meta[name="SiteName"]').prop('content'),
    };
}
