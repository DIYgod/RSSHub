import { type Cheerio, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';

const host = 'https://sec.today';

export const route: Route = {
    path: '/pulses',
    categories: ['blog'],
    example: '/sec.today/pulses',
    name: '推送',
    maintainers: ['LogicJake'],
    features: {
        antiCrawler: true,
    },
    handler,
};

async function handler() {
    const link = `${host}/pulses/`;
    const response = await ofetch(link);
    const $ = load(response);

    const out = $('div.endless_page_template div.card')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const author = $item.find('div.card-body small.card-subtitle').text().trim();
            const itemUrl = $item.find('h5.card-title > a').attr('href');
            const date = $item
                .find('p.card-text.my-1 cite small')
                .text()
                .replace(/^\s*•\s*/, '')
                .trim();
            const description = copyNodes($item.find('p.card-text.my-1'));
            description.find('cite').remove();
            description
                .contents()
                .filter((_, node) => node.type === 'text' && node.data.trim() === '–')
                .remove();
            return {
                link: new URL(itemUrl!, host).href,
                description: description.html(),
                title: $item.find('h5.card-title').text(),
                author,
                pubDate: date ? parseRelativeDate(date) : undefined,
            };
        });

    return {
        title: '每日安全推送',
        link,
        item: out,
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
