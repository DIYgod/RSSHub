// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? '0';

    const id = Number.parseInt(category);
    const isNumber = !isNaN(id);

    const rootUrl = 'https://fjksbm.com';
    const currentUrl = `${rootUrl}/portal${isNumber ? '' : `/${category}`}`;

    const response = await got(currentUrl);

    const $ = load(response.data);

    const list = (isNumber ? $('.panel-body').eq(id).find('.examName a') : $('.panel-body ul li a')).toArray().map((item) => {
        item = $(item);
        const link = item.attr('href');

        return {
            title: item.text(),
            link: link.startsWith('//') ? (link.startsWith('https') ? link : `https:${link}`) : `${rootUrl}${link}/news/bulletin`,
        };
    });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                content('h3').remove();
                content('.panel-body div').eq(0).remove();

                item.description = content('.panel-body').html();
                item.pubDate = timezone(parseDate(detailResponse.data.match(/发布时间：(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/)[1]), 8);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${$('.panel-heading')
            .eq(isNumber ? id : 1)
            .text()} - 福建考试报名网`,
        link: currentUrl,
        item: items,
    });
};
