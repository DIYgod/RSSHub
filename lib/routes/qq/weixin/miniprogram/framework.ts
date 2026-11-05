import { type Cheerio, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/weixin/miniprogram/framework',
    categories: ['programming'],
    example: '/qq/weixin/miniprogram/framework',
    name: '基础库更新日志',
    maintainers: ['magicLaLa', 'nczitzk'],
    handler,
};

async function handler() {
    const link = 'https://developers.weixin.qq.com/miniprogram/dev/framework/release/';
    const response = await ofetch(link);
    const $ = load(response);
    const name = copyNodes($('#docContent .content h1')).find('a.header-anchor').remove().end().text();

    const items = $('#docContent .content h2')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = copyNodes($item).find('a.header-anchor').remove().end().text();
            const date = /\d{4}[.-]\d{2}[.-]\d{2}/.exec(title)?.[0];
            return {
                title,
                description: $item
                    .nextUntil('h2')
                    .toArray()
                    .map((element) => $.html(element))
                    .join(''),
                pubDate: date ? timezone(parseDate(date.replaceAll('.', '-')), 8) : undefined,
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
