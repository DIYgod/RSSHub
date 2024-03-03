// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
const { rootUrl } = require('./utils');

export default async (ctx) => {
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
                    content(this).attr('src', content(this).attr('src').replaceAll('\\"', ''));
                });

                item.description = content.html();
                item.author = author = detailResponse.data.match(/"name":"(.*)","role_id/)[1];

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${author} - Odaily星球日报`,
        link: `${rootUrl}/user/${id}`,
        item: items,
    });
};
