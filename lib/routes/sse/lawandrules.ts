// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const slug = ctx.req.param('slug') ?? 'latest';

    const rootUrl = 'https://www.sse.com.cn';
    const currentUrl = `${rootUrl}/lawandrules/guide/${slug.replaceAll('-', '/')}`;
    const response = await got(currentUrl);

    const $ = load(response.data);

    const list = $('.sse_list_1 dl dd')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: `${rootUrl}${item.find('a').attr('href')}`,
                pubDate: parseDate(item.find('span').text().trim()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.description = content('.allZoom').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
