// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? 'tzgg';
    const type = ctx.req.param('type') ?? '';

    const rootUrl = 'http://hr.uibe.edu.cn';
    const currentUrl = `${rootUrl}/${category}${type ? `/${type}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.lawul, .longul')
        .find('li a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('p').text(),
                link: `${currentUrl}/${item.attr('href')}`,
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

                    item.description = content('.gp-article').html();
                    item.pubDate = parseDate(content('#shareTitle').next().text().replace('时间：', ''));
                } catch {
                    item.description = 'Not Found';
                }

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${$('.picTit').text()} - 对外经济贸易大学人力资源处`,
        link: currentUrl,
        item: items,
    });
};
