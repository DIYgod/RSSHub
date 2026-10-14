import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/warp/blog',
    url: 'warp.dev',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.warp.dev'],
            target: '/blog',
        },
    ],
    name: 'Blog',
    maintainers: ['cscnk52'],
    handler,
    description: 'Provides a better reading experience (full articles) over the official ones.',
    view: ViewType.Notifications,
};
function parseSourceTime(value: unknown) {
    if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
async function handler() {
    const feed = await parser.parseURL('https://www.warp.dev/blog/feed.xml');
    if (!feed.title) {
        throw new Error('Warp blog feed has no title');
    }
    const items = await pMap(
        feed.items,
        async (item) => {
            const { link, title } = item;
            if (!link || !title) {
                throw new Error('Warp blog feed item has no link or title');
            }
            const details = await cache.tryGet<Pick<DataItem, 'description' | 'author' | 'pubDate'>>(`warp:detail-with-metadata:${link}`, async () => {
                const data = await ofetch(link);
                const $ = load(data);
                const article = $('main article').first();
                const authors = mapElements(article.children('header').find('[data-sanity*="path=authors"] span:not([aria-hidden])'), (_, element) => $(element).text());
                const main = article.children('div').first();
                if (!main.length) {
                    throw new Error(`Warp blog article has no body: ${link}`);
                }
                const hero = article.children('header').children('[class*="aspect-"]').find('img').first();
                if (hero.length) {
                    main.prepend(copyContent(hero, $));
                }
                // clean HTML
                main.find('style').remove();
                main.find('[style]').removeAttr('style');
                main.find('[class]').removeAttr('class');
                main.find('[id]').removeAttr('id');
                main.find('[preload]').removeAttr('preload');
                return { description: main.html(), author: authors.length ? authors.join(', ') : undefined, pubDate: parseSourceTime(article.children('header').find('time[datetime]').first().attr('datetime')) };
            });
            return {
                title,
                link,
                ...details,
                pubDate: parseSourceTime(item.pubDate) ?? details.pubDate,
                author: item.creator || details.author,
                category: item.categories,
            };
        },
        { concurrency: 3 }
    );
    return {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        language: 'en',
    } satisfies Data;
}
function mapElements<T, U>(selection: Cheerio<T>, mapper: (index: number, node: T) => U | U[] | null | undefined): U[] {
    return selection.toArray().flatMap((node, index) => mapper(index, node) ?? []);
}
function copyContent<T extends AnyNode>(selection: Cheerio<T>, $: CheerioAPI): Cheerio<T> {
    const nodes = selection.toArray().map((node) => cloneNode(node, true));
    const root = new Document(nodes);
    for (const node of nodes) {
        node.parent = root;
    }
    return $(nodes);
}
