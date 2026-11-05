import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

const lists = {
    free: ['Free ebooks and deals', '.block-views-blockblock-ebook-feature-homepage-todays-free-ebooks'],
    editor: ["Editor's choice", '.block-views-blockbooks-block-editor-choice'],
    trending: ['Trending books', '.block-views-blockbooks-block-trending-books'],
    classics: ['Popular classics', '.block-views-blockbooks-block-popular-classics'],
};

export const route: Route = {
    path: '/books/:list?',
    categories: ['reading'],
    example: '/manybooks/books/trending',
    parameters: {
        list: {
            description: 'Homepage book list.',
            default: 'free',
            options: Object.entries(lists).map(([value, [label]]) => ({ value, label })),
        },
    },
    name: 'Book lists',
    maintainers: ['DIYgod'],
    description: 'For the ManyBooks blog, use the native feed at <https://manybooks.net/rss.xml>.',
    radar: [{ source: ['manybooks.net'], target: '/books' }],
    handler,
};

export async function getBooks(link: string, selector: string) {
    const response = await ofetch(link);
    const $ = load(response);
    const items = $(selector)
        .find('article')
        .toArray()
        .map((element) => {
            const book = $(element);
            const title = book.find('.field--name-field-title a, .block-field-blocknodeebook-featuretitle a').first();
            const image = book.find('img').first();
            const imageUrl = image.attr('data-src') ?? image.attr('src');
            return {
                title: title.text(),
                link: new URL(title.attr('href')!, link).href,
                author: book.find('.field--name-field-author-er, .field--name-field-af-name').first().text() || undefined,
                category: book
                    .find('.field--name-field-eb-genre a')
                    .toArray()
                    .map((tag) => $(tag).text()),
                description: renderToString(
                    <>
                        {imageUrl && <img src={new URL(imageUrl, link).href} alt="" />}
                        <div dangerouslySetInnerHTML={{ __html: book.find('.field--name-body').html() ?? '' }} />
                    </>
                ),
            };
        });
    return new Map(items.map((item) => [item.link, item])).values().toArray();
}

async function handler(ctx) {
    const list = ctx.req.param('list') ?? 'free';
    if (!Object.hasOwn(lists, list)) {
        throw new InvalidParameterError(`Unknown book list. Supported: ${Object.keys(lists).join(', ')}.`);
    }
    const link = 'https://manybooks.net/';
    return { title: `ManyBooks - ${lists[list][0]}`, link, item: await getBooks(link, lists[list][1]) };
}
