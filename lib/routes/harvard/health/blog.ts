// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://www.health.harvard.edu';
    const currentUrl = `${rootUrl}/blog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.lg\\:text-2xl')
        .toArray()
        .map((item) => {
            item = $(item).parent();

            return {
                title: item.text(),
                link: item.attr('href'),
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

                const ldJson = JSON.parse(content('script[type="application/ld+json"]').text())['@graph'].find((i) => i['@type'] === 'Article');

                item.description = content('.content-repository-content').html();
                item.pubDate = parseDate(ldJson.datePublished);
                item.author = ldJson.author.name;

                return item;
            })
        )
    );

    ctx.set('data', {
        title: 'Harvard Health Blog',
        link: currentUrl,
        item: items,
    });
};
