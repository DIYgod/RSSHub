// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const rootUrl = 'https://database.caixin.com';
    const currentUrl = `${rootUrl}/news/`;
    const response = await got(currentUrl);

    const $ = load(response.data);

    const list = $('h4 a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href').replace('http://', 'https://'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.pubDate = timezone(parseDate(content('#pubtime_baidu').text()), +8);
                item.description = art(path.join(__dirname, 'templates/article.art'), {
                    item,
                    $: content,
                });
                item.author = content('.top-author').text();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: '财新数据通 - 专享资讯',
        link: currentUrl,
        item: items,
    });
};
