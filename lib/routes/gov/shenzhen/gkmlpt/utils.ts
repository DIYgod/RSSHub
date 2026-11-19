import type { z } from 'zod';

import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

import type { Article, GkmlptCategory } from './types';
import { ArticleResponseSchema } from './types';

/**
 * Id of the "all categories" entry, which every district's directory tree carries as `0`.
 */
export const defaultOption = '0';

/**
 * Fetch one category's article list from a Guangdong government disclosure platform.
 *
 * @param {string} baseUrl - Site base URL including the scheme, e.g. `https://www.szft.gov.cn/ftqjsj`.
 * @param {string} id - Category id as it appears in the page hash, e.g. `9084`.
 * @returns {Promise<Article[]>} Articles of the category, newest first as returned by the platform.
 */
export const getArticleList = async (baseUrl: string, id: string): Promise<Article[]> => {
    const response = await ofetch<z.infer<typeof ArticleResponseSchema>>(`${baseUrl}/gkmlpt/api/all/${id}`, {
        // These platforms finish the ECDHE key exchange with a point that OpenSSL rejects
        // (`bad ecpoint`) when the client offers its full curve list, so P-256 is pinned.
        ecdhCurve: 'P-256',
        schema: ArticleResponseSchema,
    });

    return response.articles;
};

/**
 * Map platform articles to feed items. The platform's `date` is a unix timestamp in seconds
 * already aligned to midnight in UTC+8, so `X` is used directly. Do not wrap it in
 * `timezone(..., 8)` the way date strings from other gov routes are.
 *
 * @param {Article[]} articles - Articles returned by the platform.
 * @returns {DataItem[]} Feed items with title, link, publication date and language.
 */
export const getArticleDataItems = (articles: Article[]): DataItem[] =>
    articles.map((article) => ({
        title: article.title,
        link: article.url,
        pubDate: parseDate(article.date, 'X'),
        language: 'zh-CN',
    }));

/**
 * Build the public page link of one category. The platform keeps every category on the same
 * page and selects it by hash, except for the "all categories" entry which has no hash.
 *
 * @param {string} baseUrl - Site base URL including the scheme, e.g. `https://www.szft.gov.cn/ftqjsj`.
 * @param {GkmlptCategory} category - Category the feed is generated for.
 * @returns {string} Link to the category on the source site.
 */
export const getCategoryLink = (baseUrl: string, category: GkmlptCategory): string => `${baseUrl}/gkmlpt/index${category.id === defaultOption ? '' : `#${category.id}`}`;

/**
 * Build the lookup map from the same category definitions used for options.
 *
 * @param {GkmlptCategory[]} categories - District category definitions.
 * @returns {Map<string, GkmlptCategory>} Categories keyed by id.
 */
export const buildCategoryMap = (categories: GkmlptCategory[]): Map<string, GkmlptCategory> => new Map(categories.map((category): [string, GkmlptCategory] => [category.id, category]));

/**
 * Build the parameter options from the same category definitions used for lookups.
 *
 * @param {GkmlptCategory[]} categories - District category definitions.
 * @returns {Array<{ value: string; label: string }>} Options for `parameters.caty` and the description table.
 */
export const buildOptions = (categories: GkmlptCategory[]): Array<{ value: string; label: string }> => categories.map(({ id, title }) => ({ value: id, label: title }));
