import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: ['/sh/yjj/*', '/shanghai/yjj/*'],
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const params = getSubPath(ctx) === '/sh/yjj' ? '/sh/yjj/zx-ylqx' : getSubPath(ctx);

    const rootUrl = 'https://yjj.sh.gov.cn';
    const currentUrl = `${rootUrl}${params.replace(/^\/sh\/yjj/, '')}/index.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.pageList li a')
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text(),
                pubDate: parseDate(item.next().text()),
                link: link.startsWith('http') ? link : `${rootUrl}${link}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    const pubDate = content('meta[name="pubdate"]').attr('content') || content('meta[name="PubDate"]').attr('content');

                    item.description = content('#ivs_content').html();
                    item.pubDate = timezone(parseDate(pubDate, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm']), +8);
                } catch {
                    // no-empty
                }

                return item;
            })
        )
    );

    return {
        title: $('title').text().replace(/--/, ' - '),
        link: currentUrl,
        item: items,
    };
}
