import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';

import got from '@/utils/got';

/**
 * Returns the article body from a loaded article page.
 *
 * Multi-page articles only show their first page at the article URL. Their `_s.shtml`
 * variant has the whole text on one page, but it only exists for those articles: for a
 * single-page article it redirects to the homepage. The `.module-page` pager tells them apart.
 */
export const getFullText = async ($: CheerioAPI, link: string) => {
    const firstPage = $('.all-txt').html();
    if (!link.endsWith('.shtml') || $('.module-page').length === 0) {
        return firstPage;
    }

    const response = await got(link.replace(/\.shtml$/, '_s.shtml'));
    return load(response.data)('.all-txt').html() || firstPage;
};
