import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/weixin/miniprogram/devtools',
    categories: ['programming'],
    example: '/qq/weixin/miniprogram/devtools',
    name: '开发者工具更新日志',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const link = 'https://developers.weixin.qq.com/miniprogram/dev/devtools/uplog.html';
    const response = await ofetch(link);
    const $ = load(response);
    const name = $('#docContent .content h1')
        .text()
        .replaceAll(/[\s#|]/g, '');

    const items = $('#docContent .content h3')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item
                .text()
                .replaceAll(/[\s#|]/g, '')
                .replaceAll('更新说明', '');
            const version = /^\d+\.\d+\.(\d{6})/.exec(title);
            return {
                title,
                description:
                    ($item.text().includes('更新说明') ? '<h3><a href="' + $item.find('a[target="_blank"]').attr('href') + '" target="_blank" rel="noopener noreferrer">更新说明<span></span></a></h3>' : '') + $item.next().html(),
                pubDate: timezone(version ? parseDate(version[1], 'YYMMDD') : parseDate(title), 8),
                link: link + $item.find('a.header-anchor').attr('href'),
            };
        });

    return {
        title: name,
        link,
        item: items,
        description: name,
    };
}
