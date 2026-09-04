import type { Context } from 'hono';

import type { Data, DataItem, Language, Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { apiUrl, bookElements, getTaxonomy, mapArticle, siteUrl } from './utils';

const mapBook = (item): Promise<DataItem> => {
    const bookTitle: string | undefined = item.elements.book_title?.value || undefined;
    const bookAuthor: string | undefined = item.elements.book_author?.value || undefined;
    const lead = bookTitle ? `<p><em>${bookTitle}${bookAuthor ? ` by ${bookAuthor}` : ''}</em></p>` : '';

    return mapArticle(item, lead);
};

export const handler = async (ctx: Context): Promise<Data> => {
    const { category } = ctx.req.param();
    const limit = Number(ctx.req.query('limit') ?? '30');

    const search = new URLSearchParams({
        'system.type': 'article',
        'elements.book_title[neq]': '',
        order: 'elements.date[desc]',
        limit: String(limit),
        elements: bookElements,
        ...(category && { 'elements.page_taxonomy_set__gn_taxonomy[contains]': category.replaceAll('-', '_') }),
    });

    const response = await ofetch(`${apiUrl}?${search.toString()}`);

    const codename = category?.replaceAll('-', '_');
    const entry = codename ? (await getTaxonomy())[codename] : undefined;
    if (category && (!entry || entry.parent !== 'books')) {
        throw new Error(`Unknown Gates Notes book category "${category}". Valid categories are listed on ${siteUrl}/books`);
    }

    return {
        title: entry ? `Gates Notes - Book Reviews - ${entry.name}` : 'Gates Notes - Book Reviews',
        description: 'Book reviews by Bill Gates from [Gates Notes](https://www.gatesnotes.com/books).',
        link: `${siteUrl}/books`,
        language: 'en' as const satisfies Language,
        icon: `${siteUrl}/favicon.ico`,
        logo: `${siteUrl}/favicon.ico`,
        author: 'Bill Gates',
        item: await Promise.all(response.items.map((item) => mapBook(item))),
    };
};

export const route: Route = {
    path: '/books/:category?',
    name: 'Book Reviews',
    url: 'www.gatesnotes.com',
    maintainers: ['wongJG'],
    handler,
    example: '/gatesnotes/books/science',
    parameters: {
        category: {
            description: 'Book category, can be found in the URL of the corresponding category page on Gates Notes, e.g. `science` or `science-fiction`; leave empty for all book reviews',
        },
    },
    description: 'Subscribe to the book reviews by Bill Gates from [Gates Notes](https://www.gatesnotes.com/books).',
    categories: ['blog'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.gatesnotes.com/books'],
            target: '/books',
        },
        {
            source: ['www.gatesnotes.com/books/:category'],
            target: '/books/:category',
        },
    ],
};
