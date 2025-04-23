import { Data, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { Context } from 'hono';

const DOMAIN = 'gss.mof.gov.cn';

const handler = async (ctx: Context): Promise<Data | null> => {
    const { category = 'zhengcefabu' } = ctx.req.param();
    const currentUrl = `https://${DOMAIN}/gzdt/${category}/`;
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
            const href = a.prop('href') as string;
            const link = href.startsWith('http') ? href : new URL(href, currentUrl).href;
            return {
                title: a.prop('title'),
                link,
                pubDate: timezone(parseDate(pubDate), +8),
            };
        });

    const items = await Promise.all(
        indexes.map((item: Data) =>
            cache.tryGet(item.link!, async () => {
                const { data: detailResponse } = await got(item.link);
                const content = load(detailResponse);
                item.description = content('div.my_doccontent').html() ?? '';
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
    } as Data;
};

export const route: Route = {
    path: '/mof/gss/:category?',
    categories: ['government'],
    example: '/gov/mof/gss',
    parameters: { category: '列表标签，默认为政策发布' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '关税政策文件',
    maintainers: ['la3rence'],
    handler,
    description: `#### 关税文件发布

| 政策发布 | 政策解读 |
| ------------- | -------------- |
| zhengcefabu   | zhengcejiedu   |`,
    radar: [
        {
            source: ['gss.mof.gov.cn/gzdt/:category/'],
            target: '/mof/gss/:category',
        },
    ],
};
