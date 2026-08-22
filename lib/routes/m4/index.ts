import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/news/:category?',
    categories: ['new-media'],
    example: '/m4/news/china',
    parameters: { category: '分类，见下表，默认为国内新闻' },
    description: `| 分类                                  | ID         |
| ------------------------------------- | ---------- |
| [国内新闻](http://news.m4.cn/china/)  | china      |
| [国际新闻](http://news.m4.cn/world/)  | world      |
| [民生](http://news.m4.cn/livelihood/) | livelihood |
| [社会](http://news.m4.cn/society/)    | society    |
| [财经](http://news.m4.cn/finance/)    | finance    |
| [科技](http://news.m4.cn/tech/)       | tech       |`,
    radar: [
        {
            source: ['news.m4.cn/:category', 'news.m4.cn/'],
            target: '/news/:category',
        },
    ],
    name: '要闻',
    maintainers: ['nczitzk'],
    handler,
    url: 'news.m4.cn',
};

export async function handler(ctx) {
    const [id, category = 'china'] = getSubPath(ctx).split('/').filter(Boolean);
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30;

    const rootUrl = `http://${id}.m4.cn`;
    const currentUrl = new URL(`/${category}/`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('div.articleitem0 div.aheader0')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            const $item = $(item);

            const a = $item.find('a').first();

            return {
                title: a.text(),
                link: a.prop('href'),
                description: renderDescription({
                    images: [
                        {
                            src: $item.parent().find('div.aimg0 a img').prop('src'),
                            alt: a.text(),
                        },
                    ],
                }),
                category: $item
                    .find('a.aclass')
                    .toArray()
                    .map((c) => $(c).text().replaceAll('[]', '').trim()),
                pubDate: timezone(parseDate($item.find('span.atime').text()), 8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = content('h1').first().text();
                item.description = renderDescription({
                    intro: content('div.aintro1, p.cont-summary').text(),
                    description: content('div.content0, div.cont-detail').html() ?? undefined,
                });
                item.category = content('span.dd0 a, a[rel="category"]')
                    .toArray()
                    .map((c) => content(c).text())
                    .slice(1);
                item.pubDate = timezone(parseDate(content('span.atime1, span.post-time').text()), 8);

                return item;
            })
        )
    );

    const image = $('a.logo0_b img').prop('src');

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh' as const,
        image,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author: $('meta[name="author"]').prop('content'),
        allowEmpty: true,
    };
}
