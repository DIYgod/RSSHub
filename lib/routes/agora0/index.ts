import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/agora0/initium',
    parameters: { category: '分类，见下表，默认为 initium，即端传媒' },
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
            source: ['agora0.gitlab.io/blog/:category', 'agora0.gitlab.io/'],
            target: '/:category',
        },
    ],
    name: '零博客',
    maintainers: ['nczitzk'],
    handler,
    description: `| muitinⒾ | aidemnⒾ | srettaⓂ | qⓅ | sucoⓋ |
| ------- | ------- | -------- | -- | ----- |
| initium | inmedia | matters  | pq | vocus |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'initium';

    const rootUrl = 'https://agora0.gitlab.io';
    const currentUrl = `${rootUrl}/blog/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.card span:not(.comments) a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
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

                item.author = content('meta[name="author"]').attr('content');
                item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content'));
                item.description = content('.post-content').html();

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
