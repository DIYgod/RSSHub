import { beforeEach, describe, expect, it, vi } from 'vitest';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import ofetch from '@/utils/ofetch';

import { handler as booksHandler } from './books';
import { articleElements, bookElements, mapArticle } from './utils';
import { handler as workHandler } from './work';

vi.mock('@/utils/ofetch', () => ({ default: vi.fn() }));
vi.mock('@/utils/cache', () => ({ default: { tryGet: (_key, callback) => callback() } }));

const context = (params) => ({ req: { param: () => params, query: () => {} } });
const taxonomy = { terms: [{ codename: 'books', name: 'Books', terms: [{ codename: 'science', name: 'Science', terms: [] }] }] };

beforeEach(() => {
    vi.mocked(ofetch).mockReset();
    vi.mocked(ofetch).mockResolvedValue(taxonomy);
});

describe('Gates Notes review fixes', () => {
    it('rejects an unknown book category before requesting articles', async () => {
        await expect(booksHandler(context({ category: 'unknown' }) as never)).rejects.toBeInstanceOf(InvalidParameterError);
        expect(ofetch).toHaveBeenCalledTimes(1);
        expect(ofetch).toHaveBeenCalledWith(expect.stringContaining('/taxonomies/'));
    });

    it('rejects a book category used as a work topic', async () => {
        await expect(workHandler(context({ topic: 'science' }) as never)).rejects.toBeInstanceOf(InvalidParameterError);
        expect(ofetch).toHaveBeenCalledTimes(1);
    });

    it('maps taxonomy labels and omits SEO keywords and unknown terms', async () => {
        vi.mocked(ofetch)
            .mockResolvedValueOnce(taxonomy)
            .mockResolvedValueOnce({ item: { elements: { body_content: { value: '<p>Article</p>' } } } });
        const item = await mapArticle({
            system: { codename: 'article', name: '/article' },
            elements: {
                article_title: { value: 'Title' },
                page_taxonomy_set__gn_taxonomy: { value: ['science', 'unknown'] },
                page_meta_set__keywords: { value: 'SEO keyword' },
            },
        });
        expect(item.category).toEqual(['Science']);
        expect(item.description).toBe('<p>Article</p>');
        for (const elements of [articleElements, bookElements]) {
            expect(elements).toContain('page_taxonomy_set__gn_taxonomy');
            expect(elements).not.toContain('page_meta_set__keywords');
        }
    });
});
