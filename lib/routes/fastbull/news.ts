import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const rootUrl = 'https://www.fastbull.cn';
    const currentUrl = `${rootUrl}/news`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.trending_type')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('.title').text(),
                link: `${rootUrl}${item.attr('href')}`,
                author: item.find('.resource').text(),
                description: item.find('.tips').text(),
                pubDate: parseDate(Number.parseInt(item.find('.new_time').attr('data-date'))),
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

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    tips: item.description,
                    description: content('.news-detail-content').html(),
                });

                return item;
            })
        )
    );

    ctx.set('data', {
        title: '财经头条、财经新闻、最新资讯 - FastBull',
        link: currentUrl,
        item: items,
    });
};
