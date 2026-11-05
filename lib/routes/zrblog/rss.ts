import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/zrblog',
    radar: [
        {
            source: ['zrblog.net/'],
        },
    ],
    name: '最新文章',
    maintainers: ['cnkmmk'],
    handler,
    url: 'zrblog.net/',
};
async function handler() {
    const url = 'https://www.zrblog.net/';
    const response = await got({ method: 'get', url });
    const $ = load(response.data);
    const list = $('article.excerpt')
        .toArray()
        .map((e) => {
            const element = $(e);
            const title = element.find('h2 > a').text();
            const link = element.find('h2 > a').attr('href');
            const description = element.find('p.note').text();
            const dateText = element.find('time').text();
            const category = copyContent(element.find('a.cat'), $).find('i').remove().end().text();
            return {
                title,
                description,
                link: link ? new URL(link, url).href : undefined,
                pubDate: dateText ? parseDate(dateText, 'YYYY-MM-DD') : undefined,
                category: category ? [category] : undefined,
            };
        });
    return {
        title: '赵容部落',
        link: url,
        item: list,
    };
}
function copyContent<T extends AnyNode>(selection: Cheerio<T>, $: CheerioAPI): Cheerio<T> {
    const nodes = selection.toArray().map((node) => cloneNode(node, true));
    const root = new Document(nodes);
    for (const node of nodes) {
        node.parent = root;
    }
    return $(nodes);
}
