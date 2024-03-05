// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://research.samsung.com';
    const currentUrl = `${rootUrl}/blogMain/list.json`;

    const response = await got({
        method: 'post',
        url: currentUrl,
        json: {
            currentPageNo: 0,
            endIndex: 9,
            startIndex: 0,
        },
    });

    let items = response.data.value.map((item) => ({
        title: item.title,
        author: item.authorName,
        link: `${rootUrl}${item.urlLink}`,
        category: [item.catagoryCode, item.hashTag1, item.hashTag2],
        pubDate: parseDate(item.publicationDtsStr.replace(/On /, ''), 'MMMM D, YYYY'),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.news-con').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: 'BLOG | Samsung Research',
        link: `${rootUrl}/blog`,
        item: items,
    });
};
