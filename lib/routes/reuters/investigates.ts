// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://www.reuters.com';
    const currentUrl = `${rootUrl}/investigates/`;
    const response = await got(currentUrl);

    const $ = load(response.data);

    const list = $('article.section-article-container.row')
        .map((_, item) => ({
            title: $(item).find('h2.subtitle').text(),
            link: $(item).find('a.row.d-flex').prop('href'),
        }))
        .get();
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.title = content('title').text();
                item.description = content('article.special-report').html();
                item.pubDate = parseDate(content('time[itemprop="datePublished"]').attr('datetime'));
                item.author = content('meta[property="og:article:publisher"]').attr('content');

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('h1.series-subtitle').text(),
        link: currentUrl,
        item: items,
    });
};
