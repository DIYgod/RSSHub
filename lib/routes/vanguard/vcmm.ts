import { load } from 'cheerio';
import { destr } from 'destr';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

const source = 'corporate.vanguard.com/content/corporatesite/us/en/corp/vemo/vemo-return-forecasts.html';
const link = `https://${source}`;

export const route: Route = {
    path: '/vcmm',
    name: 'Capital Markets Model Forecasts',
    url: source,
    example: '/vanguard/vcmm',
    categories: ['finance'],
    maintainers: ['wzx140'],
    radar: [{ source: [source], target: '/vcmm' }],
    handler,
};

async function handler() {
    const $ = load(await ofetch<string>(link));
    const title = $('h1').first().text();
    const { datePublished } = destr<{ datePublished?: string }>($('script[type="application/ld+json"]').first().text() || '{}');
    const pubDate = datePublished && parseDate(datePublished);

    if (!title || !pubDate) {
        throw new Error('Unable to find the Vanguard forecast title or publication date.');
    }

    const description = $('.cmp-text-p21624Regular [data-cmp-data-layer] p').first().html() ?? $('meta[property="og:description"]').attr('content');

    return {
        title,
        link,
        item: [{ title, link, guid: `${link}#${datePublished}`, description, pubDate }],
    };
}
