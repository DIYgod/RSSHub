// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://www.fastbull.cn';
    const currentUrl = `${rootUrl}/express-news`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('.news-list')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('.title_name').text(),
                pubDate: parseDate(Number.parseInt(item.attr('data-date'))),
                link: `${rootUrl}${item.find('.title_name').attr('href')}`,
            };
        });

    ctx.set('data', {
        title: '实时财经快讯 - FastBull',
        link: currentUrl,
        item: items,
    });
};
