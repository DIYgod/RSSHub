import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';

import { getBooks } from './books';

export const route: Route = {
    path: '/genre/:genre',
    categories: ['reading'],
    example: '/manybooks/genre/romance',
    parameters: { genre: 'Genre slug from a ManyBooks /genres/ page, such as romance or science-fiction.' },
    name: 'Books by genre',
    maintainers: ['DIYgod'],
    radar: [{ source: ['manybooks.net/genres/:genre'], target: '/genre/:genre' }],
    handler,
};

async function handler(ctx) {
    const genre = ctx.req.param('genre');
    if (!/^[a-z_]+(?:-[a-z]+)*$/.test(genre)) {
        throw new InvalidParameterError('Use the genre slug shown in the ManyBooks URL.');
    }
    const link = `https://manybooks.net/genres/${genre}`;
    return { title: `ManyBooks - ${genre}`, link, item: await getBooks(link, '.view-id-block_ebook_feature') };
}
