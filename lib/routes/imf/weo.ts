import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

const source = 'data.imf.org/Datasets/WEO';
const link = `https://${source}`;

export const route: Route = {
    path: '/weo',
    name: 'World Economic Outlook',
    url: source,
    example: '/imf/weo',
    categories: ['finance'],
    maintainers: ['wzx140'],
    radar: [{ source: [source, 'www.imf.org/en/Publications/WEO'], target: '/weo' }],
    handler,
};

async function handler() {
    const response = await ofetch<string>(link);
    const $ = load(response);
    const seen = new Set<string>();

    const item = $('a[href]')
        .toArray()
        .flatMap((anchor) => {
            const card = $(anchor);
            const reportLink = card.attr('href');
            const date = reportLink?.match(/^https:\/\/www\.imf\.org\/en\/publications\/weo\/issues\/(\d{4})\/(\d{2})\/(\d{2})\//i);
            const title = card.find('h3').text();

            if (!reportLink || !date || !title || seen.has(reportLink)) {
                return [];
            }

            seen.add(reportLink);
            return {
                title,
                link: reportLink,
                description: card.find('figcaption p').first().html() ?? undefined,
                pubDate: parseDate(`${date[1]}-${date[2]}-${date[3]}T00:00:00Z`),
            };
        });

    return { title: 'IMF World Economic Outlook', link, item };
}
