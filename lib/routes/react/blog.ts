import { type Cheerio, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const handler: Route['handler'] = async () => {
    const data = await ofetch('https://react.dev/blog');

    const $ = load(data);

    const list = $('a[href^="/blog/"]').slice(0, 20).toArray();
    const item = await pMap(
        list,
        (item) => {
            const link = `https://react.dev${item.attribs.href}`;

            return cache.tryGet(`react:blog:v4:${link}`, async (): Promise<DataItem> => {
                const data = await ofetch(link);

                const $ = load(data);

                const content = copyNodes($('article div.max-w-7xl').first());
                if (!content.length || !content.html()) {
                    throw new Error('React blog article content is missing');
                }
                const metadata = content.find('p.whitespace-pre-wrap').first();
                const date = metadata.text().split(/\s+by/, 1)[0];
                const author = metadata
                    .find('a')
                    .toArray()
                    .map((element) => $(element).text())
                    .join(', ');
                metadata.remove();

                return {
                    title: $('h1').first().text(),
                    link,
                    description: content.html(),
                    author: author || undefined,
                    pubDate: date ? parseDate(`${date} +0000`, date.split(' ', 1)[0].length === 3 ? 'MMM D, YYYY ZZ' : 'MMMM D, YYYY ZZ') : undefined,
                };
            });
        },
        { concurrency: 6 }
    );

    return {
        title: 'React Blog',
        link: 'https://react.dev/blog',
        language: 'en-us',
        item,
    };
};

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    categories: ['blog'],
    maintainers: ['equt'],
    example: '/react/blog',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    handler,
};

function copyNodes<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, node) => cloneNode(node, true));
    const root = new Document(copy.toArray());
    for (const node of copy) {
        node.parent = root;
    }
    return copy;
}
