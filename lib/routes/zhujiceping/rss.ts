import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/zhujiceping',
    radar: [
        {
            source: ['zhujiceping.com/'],
        },
    ],
    name: '最新发布',
    maintainers: ['cnkmmk'],
    handler,
    url: 'zhujiceping.com/',
};
async function handler() {
    const url = 'https://www.zhujiceping.com/';
    const response = await got({ method: 'get', url });
    const $ = load(response.data);
    const list = $('article.excerpt')
        .toArray()
        .map((e) => {
            const element = $(e);
            const title = element.find('h2 > a').attr('title');
            const link = element.find('h2 > a').attr('href');
            const description = element.find('p.note').text();
            const dateraw = element.find('time').text();
            const category = copyContent(element.find('.meta .cat'), $);
            category.find('i').remove();
            return {
                title: title!,
                description,
                link,
                image: element.find('a.focus img.thumb').attr('src'),
                category: category
                    .toArray()
                    .map((category) => $(category).text().trim())
                    .filter(Boolean),
                pubDate: parseDate(dateraw, 'YYYY-MM-DD'),
            };
        });
    return {
        title: '国外主机测评',
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
