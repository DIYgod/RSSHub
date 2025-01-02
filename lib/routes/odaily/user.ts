import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { rootUrl } from './utils';

export const route: Route = {
    path: '/user/:id',
    categories: ['new-media', 'popular'],
    example: '/odaily/user/2147486902',
    parameters: { id: '用户 id，可在用户页地址栏中找到' },
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
            source: ['0daily.com/user/:id', '0daily.com/'],
        },
    ],
    name: '用户文章',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const currentUrl = `${rootUrl}/service/feed_stream/user/${id}?b_id=10&per_page=${ctx.req.query('limit') ?? 25}`;

    let author = '';

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let items = response.data.data.items.data.map((item) => ({
        title: item.title,
        summary: item.summary,
        link: `${rootUrl}/post/${item.entity_id}`,
        pubDate: timezone(parseDate(item.published_at), +8),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data.match(/"content":"(.*)","extraction_tags":/)[1]);

                content('img').each(function () {
                    content(this).attr(
                        'src',
                        content(this)
                            .attr('src')
                            .replaceAll(String.raw`\"`, '')
                    );
                });

                item.description = content.html();
                item.author = author = detailResponse.data.match(/"name":"(.*)","role_id/)[1];

                return item;
            })
        )
    );

    return {
        title: `${author} - Odaily星球日报`,
        link: `${rootUrl}/user/${id}`,
        item: items,
    };
}
