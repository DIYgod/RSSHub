import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

const source = 'am.jpmorgan.com/us/en/asset-management/institutional/insights/portfolio-insights/ltcma/';
const link = `https://${source}`;

export const route: Route = {
    path: '/ltcma',
    name: 'Long-Term Capital Market Assumptions',
    url: source,
    example: '/jpmorganchase/ltcma',
    categories: ['finance'],
    maintainers: ['wzx140'],
    radar: [{ source: [source], target: '/ltcma' }],
    handler,
};

async function handler() {
    const $ = load(await ofetch<string>(link));
    const headline = $('.geo-content h1').first();
    const title = headline.text().replace(/^<p>(.*)<\/p>$/, '$1');
    const edition = title.match(/\b\d{4}\b/)?.[0];

    if (!edition) {
        throw new Error('Unable to find the edition year for J.P. Morgan Long-Term Capital Market Assumptions.');
    }

    return {
        title: 'J.P. Morgan Long-Term Capital Market Assumptions',
        link,
        item: [
            {
                title,
                link,
                guid: `${link}#${edition}`,
                description: headline.next('p').html() ?? undefined,
            },
        ],
    };
}
