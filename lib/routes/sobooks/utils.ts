import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

function getBookInfo(content: CheerioAPI, label: string) {
    return content('.book-info-item')
        .filter((_, element) => content(element).find('.book-info-label').text() === label)
        .find('.book-info-value')
        .text();
}

export const utils = async (ctx, currentUrl) => {
    const rootUrl = 'https://sobooks.cc';
    currentUrl = `${rootUrl}/${currentUrl}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.card-item h3 a')
        .slice(0, 15)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: $item.attr('href'),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(item.link!, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                content('.e-secret, .article-social').remove();

                const description = content('.post-content, .article-content').html();
                const date = getBookInfo(content, '时间：') || content('.bookinfo ul li').eq(4).text().replace('时间：', '');
                const pubDate = parseDate(date, 8);

                const author = getBookInfo(content, '作者：');
                const category = [...new Set([getBookInfo(content, '分类：'), ...(content('meta[name="keywords"]').attr('content') ?? '').split(',')].map((value) => value.trim()).filter(Boolean))];
                const image = content('.book-info-cover img').attr('src');
                return { description, pubDate, author, category, image };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: ($('.archive-header h1').text() ? $('.archive-header h1').text() + ' - ' : '') + 'SoBooks',
        link: currentUrl,
        item: items,
    };
};
