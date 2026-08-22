import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/news/jzyg',
    categories: ['university'],
    example: '/cqu/news/jzyg',
    name: '新闻网讲座预告',
    maintainers: ['nicolaszf'],
    handler,
};

async function handler() {
    const url = 'https://news.cqu.edu.cn/archives/lecture/index.html';
    const response = await ofetch(url);
    const $ = load(response);

    const result = await Promise.all(
        $('.item')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const $title1 = $item.find('.title a').eq(0);
                const $title2 = $item.find('.title a').eq(1);
                let href = $title2.attr('href');
                let title = `${$title1.text()} - ${$title2.text()}`;

                if (href === undefined) {
                    href = $title1.attr('href');
                    title = $title1.text();
                }
                const itemUrl = new URL(href!, url).href;

                return cache.tryGet(itemUrl, async () => {
                    const item = {
                        title,
                        link: itemUrl,
                        guid: itemUrl,
                        description: $item.find('.minfo').html(),
                    };
                    try {
                        const detailResponse = await ofetch(itemUrl);
                        const $detail = load(detailResponse);
                        item.description = ($detail('.dinfo').html() ?? '') + ($detail('.acontent').html() ?? '');
                    } catch {
                        // removed entries
                    }
                    return item;
                });
            })
    );

    return {
        title: '重庆大学新闻网-讲座预告',
        link: url,
        description: '重庆大学新闻网-讲座预告',
        item: result,
    };
}
