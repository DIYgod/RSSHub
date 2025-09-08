import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/ndrc/xwdt/:category{.+}?',
    name: '新闻动态',
    example: '/gov/ndrc/xwdt',
    parameters: { category: '分类，见下表，默认为新闻发布' },
    maintainers: ['nczitzk'],
    categories: ['government'],
    handler,
    radar: [
        {
            title: '中华人民共和国国家发展和改革委员会 - 新闻动态',
            source: ['ndrc.gov.cn/xwdt/:category*'],
            target: (params) => {
                const category = params.category;

                return `/gov/ndrc/xwdt/${category ? `/${category.endsWith('/') ? category : `${category}/`}` : '/'}`;
            },
        },
    ],
    description: `| 新闻发布 | 通知通告 | 委领导动态 | 司局动态 | 地方动态 |
| -------- | -------- | ---------- | -------- | -------- |
| xwfb     | tzgg     | wlddt      | sjdt     | dfdt     |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') || 'xwfb';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 25;

    const rootUrl = 'https://www.ndrc.gov.cn';
    const currentUrl = category.includes('dt') ? `${rootUrl}/xwdt/dt/${category}` : `${rootUrl}/xwdt/${category}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);
    const list = $('.u-list li a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);
            let link = item.attr('href');
            if (link.indexOf('../../..') === 0) {
                link = `${rootUrl}${link.replace('../../..', '')}`;
            } else if (link.indexOf('.') === 0) {
                link = `${currentUrl}${link.replace('.', '')}`;
            }
            return {
                title: item.text(),
                link,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                item.description = (content('.TRS_Editor').html() || content('.article_con').html() || '') + (content('.attachment').html() || '');
                item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').attr('content')!), 8);

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
