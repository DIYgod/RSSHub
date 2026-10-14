import { type Cheerio, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';

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

    const items = $('#docContent .content h2, #docContent .content h3')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = copyNodes($item).find('.header-anchor').remove().end().text();
            const version = /\d+\.\d+\.(\d{6})/.exec(title);
            const date = /\d{4}[.-]\d{2}[.-]\d{2}/.exec(title)?.[0];
            return {
                title,
                description:
                    ($item.text().includes('更新说明') ? '<h3><a href="' + $item.find('a[target="_blank"]').attr('href') + '" target="_blank" rel="noopener noreferrer">更新说明<span></span></a></h3>' : '') +
                    $item
                        .nextUntil('h2, h3')
                        .toArray()
                        .map((element) => $.html(element))
                        .join(''),
                pubDate: version ? timezone(parseDate(version[1], 'YYMMDD'), 8) : date ? timezone(parseDate(date.replaceAll('.', '-')), 8) : undefined,
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

function copyNodes<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, node) => cloneNode(node, true));
    const root = new Document(copy.toArray());
    for (const node of copy) {
        node.parent = root;
    }
    return copy;
}
