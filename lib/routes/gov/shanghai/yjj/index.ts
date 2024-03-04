// @ts-nocheck
import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const params = getSubPath(ctx) === '/shanghai/yjj' ? '/shanghai/yjj/zx-ylqx' : getSubPath(ctx);

    const rootUrl = 'https://yjj.sh.gov.cn';
    const currentUrl = `${rootUrl}${params.replace(/^\/shanghai\/yjj/, '')}/index.html`;

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

    ctx.set('data', {
        title: $('title').text().replace(/--/, ' - '),
        link: currentUrl,
        item: items,
    });
};
