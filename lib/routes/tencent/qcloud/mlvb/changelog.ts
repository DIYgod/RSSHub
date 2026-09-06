import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/qcloud/mlvb/changelog',
    categories: ['program-update'],
    example: '/tencent/qcloud/mlvb/changelog',
    name: '腾讯云移动直播 SDK 更新日志',
    maintainers: ['EkkoG'],
    handler,
};

async function handler() {
    const url = 'https://cloud.tencent.com/document/product/454/7878';

    const response = await ofetch(url);
    const hydrationData = response.match(/window\.__staticRouterHydrationData\s*=\s*JSON\.parse\((".*?")\);?\s*<\/script>/s);
    if (!hydrationData) {
        throw new Error('Cannot find hydration data');
    }
    const article = JSON.parse(JSON.parse(hydrationData[1])).loaderData['product-article'].data.article;

    const $ = load(article.content.body);

    const items = $('h3')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const date = $item.text().match(/@\s*(\d{4}[.-]\d{1,2}[.-]\d{1,2})/);
            return {
                title: $item.text(),
                description: $item
                    .parent()
                    .nextUntil('div:has(h3)')
                    .toArray()
                    .map((el) => $.html(el))
                    .join(''),
                link: `${url}#${$item.attr('id')}`,
                pubDate: date ? parseDate(date[1].replaceAll('.', '-')) : undefined,
                guid: $item.text(),
            };
        });

    return {
        title: `腾讯移动直播 SDK ${article.content.title}`,
        description: article.content.description,
        link: url,
        item: items,
    };
}
