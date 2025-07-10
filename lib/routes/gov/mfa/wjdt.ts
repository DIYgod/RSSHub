import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const categories = {
    gjldrhd: 'gjldrhd_674881',
    wsrc: 'wsrc_674883',
    wjbxw: 'wjbxw_674885',
    sjxw: 'sjxw_674887',
    fyrbt: 'fyrbt_674889',
    cfhsl: 'cfhsl_674891',
    dsrm: 'dsrm_674893',
    zwbd: 'zwbd_674895',
    zcjd: 'zcjd',
};

export const route: Route = {
    path: ['/fmprc/:category?', '/mfa/wjdt/:category?'],
    name: 'Unknown',
    maintainers: ['nicolaszf', 'nczitzk'],
    handler,
    description: `| 分类       | category |
| ---------- | -------- |
| 领导人活动 | gjldrhd  |
| 外事日程   | wsrc     |
| 部领导活动 | wjbxw    |
| 业务动态   | sjxw     |
| 发言人表态 | fyrbt    |
| 吹风会     | cfhsl    |
| 大使任免   | dsrm     |
| 驻外报道   | zwbd     |
| 政策解读   | zcjd     |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'gjldrhd';

    const rootUrl = 'https://www.mfa.gov.cn';
    const currentUrl = `${rootUrl}/web/wjdt_674879/${categories[category]}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('ul.list1 li a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 35)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href').replace(/^\./, currentUrl),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('#News_Body_Txt_A').html();
                item.pubDate = timezone(parseDate(content('.time span').last().text()), +8);
                item.category = content('meta[name="Keywords"]').attr('content')?.split(';') ?? [];

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
