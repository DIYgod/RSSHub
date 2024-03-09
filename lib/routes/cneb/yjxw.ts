import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const indexs = {
    gnxw: 0,
    gjxw: 1,
};

export default async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 400;

    const category = ctx.req.param('category') ?? '';
    const index = Object.hasOwn(indexs, category) ? indexs[category] : -1;

    const rootUrl = 'http://www.cneb.gov.cn';
    const currentUrl = `${rootUrl}/yjxw${category ? `/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    if (index !== -1) {
        const otherIndex = Math.abs(index - 1);

        $('.first-data').eq(otherIndex).remove();
        $('.moreContent').eq(otherIndex).remove();
    }

    let items = $('.list')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a');

            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: timezone(parseDate(item.find('span').text()), +8),
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

                item.description = content('.w940').html();
                item.author = content('.source span').last().text();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `国家应急广播 - ${index === -1 ? '新闻' : $('.select').text()}`,
        link: currentUrl,
        item: items,
    });
};
