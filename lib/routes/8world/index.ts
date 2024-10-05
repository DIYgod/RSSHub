import { Route } from '@/types';
import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '*',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const path = getSubPath(ctx) === '/' ? '/realtime' : getSubPath(ctx);

    const rootUrl = 'https://www.8world.com';
    const currentUrl = `${rootUrl}${path}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('div[data-column="Two-Third"] .article-title .article-link')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
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

                item.description = content('.text-long').html();
                item.title = content('meta[name="cXenseParse:mdc-title"]').attr('content');
                item.author = content('meta[name="cXenseParse:author"]').attr('content');
                item.pubDate = parseDate(content('meta[name="cXenseParse:recs:publishtime"]').attr('content'));
                item.category = content('meta[name="cXenseParse:mdc-keywords"]')
                    .toArray()
                    .map((keyword) => content(keyword).attr('content'));

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
