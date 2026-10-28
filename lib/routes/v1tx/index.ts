import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/v1tx',
    radar: [
        {
            source: ['v1tx.com/'],
            target: '',
        },
    ],
    name: '最新文章',
    maintainers: ['TonyRL'],
    handler,
    url: 'v1tx.com/',
};
async function handler() {
    const baseUrl = 'https://www.v1tx.com';
    const { data: response } = await got(baseUrl);
    const $ = load(response);
    const list = $('h2.entry-title a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: $item.attr('href'),
            };
        });
    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate' | 'updated' | 'author' | 'category'>>(`v1tx:article-details:v5:${item.link}`, async () => {
                const detailUrl = new URL(item.link!);
                if (detailUrl.hostname === 'www.v1tx.com') {
                    detailUrl.hostname = 'v1tx.com';
                }
                const { data: response } = await got(detailUrl.href);
                const $ = load(response);
                const data = JSON.parse($('script[type="application/ld+json"]').text());
                $('.entry-content figure > picture > source, noscript').remove();
                $('.entry-content img').each((_, img) => {
                    if (img.attribs.src.startsWith('data:')) {
                        img.attribs.src = img.attribs['data-lazy-src'];
                        delete img.attribs['data-lazy-src'];
                        delete img.attribs['data-lazy-srcset'];
                    }
                    delete img.attribs.srcset;
                });
                const pubDate = parsePublicationDate(data.datePublished ?? $('.entry-content').first().closest('article').find('time.published').attr('datetime'));
                const updated = parsePublicationDate(data.dateModified ?? $('.entry-content').first().closest('article').find('time.updated').attr('datetime'));
                const description = $('.entry-content').html();
                const author = $('.entry-content').first().closest('article').find('.entry-header .author a').first().text() || undefined;
                const category = $('.entry-content')
                    .first()
                    .closest('article')
                    .find('.entry-header .category-links a, .entry-footer .tags-links a')
                    .toArray()
                    .map((node) => {
                        const category = copyContent($(node), $);
                        category.find('.tag-hash').remove();
                        return category.text();
                    })
                    .filter(Boolean);
                return { description, pubDate, updated, author, category };
            });
            return { ...item, description: details.description, pubDate: details.pubDate, updated: details.updated, author: details.author, category: details.category };
        },
        { concurrency: 3 }
    );
    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link: baseUrl,
        image: `${baseUrl}/wp-content/uploads/2018/10/cropped-Favicon.webp`,
        item: items,
    };
}
function parsePublicationDate(value?: string) {
    const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:Z|[+-]\d{2}:\d{2})$/.exec(value ?? '');
    if (!match || !Number.isFinite(parseDate(match[1], 'YYYY-MM-DDTHH:mm:ss', true).getTime())) {
        return;
    }
    const date = parseDate(value!);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
function copyContent<T extends AnyNode>(selection: Cheerio<T>, $: CheerioAPI): Cheerio<T> {
    const nodes = selection.toArray().map((node) => cloneNode(node, true));
    const root = new Document(nodes);
    for (const node of nodes) {
        node.parent = root;
    }
    return $(nodes);
}
