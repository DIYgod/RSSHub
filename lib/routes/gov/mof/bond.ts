import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const domain = 'gks.mof.gov.cn';
const theme = 'guozaiguanli';

export const route: Route = {
    path: '/mof/bond/:category?',
    categories: ['government'],
    example: '/gov/mof/bond',
    parameters: { category: '专题，见下表，默认为国债管理工作动态' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '专题',
    maintainers: ['la3rence'],
    handler,
    description: `#### 政府债券管理

| 国债管理工作动态 | 记账式国债 (含特别国债) 发行 | 储蓄国债发行 | 地方政府债券管理      |
| ---------------- | ---------------------------- | ------------ | --------------------- |
| gzfxgzdt         | gzfxzjs                      | gzfxdzs      | difangzhengfuzhaiquan |`,
};

async function handler(ctx) {
    const { category = 'gzfxgzdt' } = ctx.req.param();
    const currentUrl = `https://${domain}/ztztz/${theme}/${category}/`;
    const { data: response } = await got(currentUrl);
    const $ = load(response);
    const title = $('title').text();
    const author = $('div.zzName').text();
    const siteName = $('meta[name="SiteName"]').prop('content');
    const description = $('meta[name="ColumnDescription"]').prop('content');
    const indexes = $('ul.liBox li')
        .toArray()
        .map((li) => {
            const a = $(li).find('a');
            const pubDate = $(li).find('span').text();
            const href = a.prop('href');
            const link = href.startsWith('http') ? href : new URL(href, currentUrl).href;
            return {
                title: a.prop('title'),
                link,
                pubDate: timezone(parseDate(pubDate), +8),
            };
        });

    const items = await Promise.all(
        indexes.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);
                const content = load(detailResponse);
                item.description = content('div.my_doccontent').html();
                item.author = author;
                return item;
            })
        )
    );

    return {
        item: items,
        title,
        link: currentUrl,
        description: `${description} - ${siteName}`,
        author,
    };
}
