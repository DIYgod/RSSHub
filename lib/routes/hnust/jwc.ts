import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/hnust/jwc',
    name: '教务处通知',
    maintainers: ['Pretty9'],
    handler,
};

async function handler() {
    const link = 'https://jwc.hnust.edu.cn/gzzd2_20170827120536008171/jwk3_20170827120536008171/index.htm';
    const response = await ofetch(link);
    const $ = load(response);

    const items = $('.page-list5 ul.block-list li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const href = $item.find('a').attr('href');
            if (!href) {
                return null;
            }
            const title = $item.find('.gpArticleTitle').text().trim();

            return {
                title,
                description: title,
                pubDate: timezone(parseDate($item.find('.gpArticleDate').text()), 8),
                link: new URL(href, link).href,
            };
        })
        .filter((item) => item !== null);

    return {
        title: '湖南科技大学教务处通知',
        link,
        description: '湖南科技大学教务处通知',
        image: 'https://i.loli.net/2020/03/24/EAoPzbTsBxeOdjH.jpg',
        item: items,
    };
}
