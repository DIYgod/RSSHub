// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const category = ctx.req.param('category')?.replace(/-/g, '/') ?? 'zxgg';

    const rootUrl = 'https://hr.pku.edu.cn/';
    const currentUrl = `${rootUrl}/${category}/index.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.item-list li a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text().replace(/\d+、/, ''),
                link: `${rootUrl}/${category}/${item.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.title').remove();

                item.description = content('.article').html();
                item.pubDate = parseDate(content('#date').text());

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${$('h2').text()} - ${$('title').text()}`,
        link: currentUrl,
        item: items,
    });
};
