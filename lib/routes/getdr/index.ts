// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://getdr.com/最新詐騙情報';
    const apiUrl = 'https://public-api.wordpress.com/rest/v1.1/sites/demogetdr.wordpress.com/posts';

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.posts.map((item) => ({
        link: item.URL,
        title: item.title,
        author: item.author.name,
        pubDate: parseDate(item.date),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.wp-block-image').each(function () {
                    content(this).html(`<img src="${content(this).find('img').attr('data-orig-file')}">`);
                });

                item.description = content('div[data-widget_type="theme-post-content.default"]').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: '最新詐騙情報 - 趨勢科技防詐達人',
        link: rootUrl,
        item: items,
    });
};
