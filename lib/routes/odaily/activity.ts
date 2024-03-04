// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
const { rootUrl } = require('./utils');

export default async (ctx) => {
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
                    content(this).attr('src', content(this).attr('src').replaceAll('\\"', ''));
                });

                item.description = content.html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: '活动 - Odaily星球日报',
        link: `${rootUrl}/activityPage`,
        item: items,
    });
};
