import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:id?',
    categories: ['other'],
    example: '/gdsrx',
    parameters: { id: '栏目 id，可在对应栏目页 URL 中找到，见下表，默认为法规文库' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '栏目',
    maintainers: [],
    handler,
    description: `| 栏目名称          | 栏目 id |
  | ----------------- | ------- |
  | 法规文库          | 10      |
  | 法规资讯          | 12      |
  | 专家供稿          | 13      |
  | 协会动态 会员动态 | 20      |
  | 协会动态          | 37      |
  | 协会通知公告      | 38      |
  | 会员动态          | 39      |`,
};

async function handler(ctx) {
    const { id = '10' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;

    const rootUrl = 'http://www.gdsrx.org.cn';
    const currentUrl = new URL(`portal/list/index/id/${id}.html`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('a.xn-item, a.t-item')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('div.xn-d, div.t-e').text(),
                link: new URL(item.prop('href'), rootUrl).href,
                pubDate: parseDate(item.find('div.xn-time, div.t-f').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                const categories = content('a.nav-a')
                    .slice(1)
                    .toArray()
                    .map((c) => content(c).text());

                item.title = categories.pop() || content('div.u-c').text();
                item.description = content('div.u-f').html();
                item.author = content('.author').text();
                item.category = categories;
                item.pubDate = parseDate(content('div.u-d').text());

                return item;
            })
        )
    );

    const author = $('title').text();
    const image = $('a.h-g img').prop('src');
    const icon = new URL('favicon.ico', rootUrl).href;
    const subtitle = $('a.nav-a')
        .toArray()
        .map((c) => $(c).text())
        .pop();

    return {
        item: items,
        title: `${author} - ${subtitle}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle,
        author,
    };
}
