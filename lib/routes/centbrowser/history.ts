import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/history',
    categories: ['program-update'],
    example: '/centbrowser/history',
    name: '更新日志',
    maintainers: ['hoilc'],
    handler,
};

async function handler() {
    const url = 'https://centbrowser.cn/history.html';

    const response = await ofetch(url);
    const $ = load(response);

    const items = $('.list')
        .toArray()
        .map((update) => {
            const $update = $(update);
            const version = $update.find('p').attr('id')!;
            const date = $update
                .find('p > i')
                .text()
                .match(/\d+-\d+-\d+/)![0];
            $update.find('p').remove();

            return {
                title: version,
                author: 'Cent Browser',
                description: $update.html(),
                link: `${url}#${date}`,
                pubDate: parseDate(date),
            };
        });

    return {
        title: 'Cent Browser 更新日志',
        link: url,
        item: items,
    };
}
