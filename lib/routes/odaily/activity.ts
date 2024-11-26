import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { rootUrl } from './utils';

export const route: Route = {
    path: '/activity',
    categories: ['new-media', 'popular'],
    example: '/odaily/activity',
    parameters: {},
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
            source: ['0daily.com/activityPage', '0daily.com/'],
        },
    ],
    name: '活动',
    maintainers: ['nczitzk'],
    handler,
    url: '0daily.com/activityPage',
};

async function handler(ctx) {
    const currentUrl = `${rootUrl}/service/scheme/group/8?page=1&per_page=${ctx.req.query('limit') ?? 25}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let items = response.data.data.items.data.map((item) => ({
        title: item.title,
        link: `${rootUrl}/activity/${item.id}`,
        pubDate: timezone(parseDate(item.published_at), +8),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data.match(/"content":"(.*)"}},"secondaryList":/)[1]);

                content('img').each(function () {
                    content(this).attr(
                        'src',
                        content(this)
                            .attr('src')
                            .replaceAll(String.raw`\"`, '')
                    );
                });

                item.description = content.html();

                return item;
            })
        )
    );

    return {
        title: '活动 - Odaily星球日报',
        link: `${rootUrl}/activityPage`,
        item: items,
    };
}
