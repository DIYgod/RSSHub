import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    categories: ['multimedia'],
    example: '/btbtla/gxlist',
    handler,
    maintainers: ['Hermes1030'],
    name: 'BTBTLA | 最近更新',
    path: '/gxlist',
    url: 'btbtla.com/tt/gxlist.html',
};

async function handler() {
    const link = 'https://btbtla.com/tt/gxlist.html';

    const response = await ofetch(link);
    const $ = load(response);

    const items = $('.tgxtablerow')
        .toArray()
        .map((element) => {
            const $row = $(element);
            const title = $row.find('.clickable-row b').text();
            const link = $row.find('.clickable-row a').attr('href');
            const size = $row.find('.tgxtablecell:nth-child(3) .badge').text();
            const views = $row.find('.tgxtablecell:nth-child(4) b').text();
            const time = $row.find('.tgxtablecell:nth-child(5) small').text();
            return {
                title,
                link: link ? `https://btbtla.com${link}` : '',
                description: `大小: ${size}, 下载量: ${views}, 时间: ${time}`,
            };
        });

    const moduleTitle = 'BTBTLA | ' + $('.module-title').text();

    return {
        title: moduleTitle,
        link,
        description: moduleTitle,
        item: items,
    };
}
