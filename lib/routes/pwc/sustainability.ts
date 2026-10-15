import { load } from 'cheerio';

import type { Language, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface Publication {
    title: string;
    url: string;
    description: string;
    publishDate: string;
    contentTheme: string[];
}

export const route: Route = {
    path: '/strategyand/sustainability',
    categories: ['other'],
    example: '/pwc/strategyand/sustainability',
    radar: [
        {
            source: ['strategyand.pwc.com/at/en/functions/sustainability-strategy/publications.html', 'strategyand.pwc.com/'],
        },
        {
            source: ['www.strategyand.pwc.com/at/en/functions/sustainability-strategy/publications.html'],
        },
    ],
    name: 'Sustainability',
    maintainers: ['mintyfrankie'],
    handler,
    url: 'strategyand.pwc.com/at/en/functions/sustainability-strategy/publications.html',
};

async function handler() {
    const baseUrl = 'https://www.strategyand.pwc.com/at/en/functions/sustainability-strategy/publications.html';
    const feedLang: Language = 'en';
    const feedDescription = 'Sustainability Publications from PwC Strategy&';

    const response = await ofetch(baseUrl, { responseType: 'text' });
    const $ = load(response);
    const collection: { listItemCollection: Publication[] } = JSON.parse($('collection-v3-listing').attr('filter1')!);

    const items = collection.listItemCollection.map((item) => ({
        title: item.title,
        link: item.url,
        pubDate: item.publishDate ? parseDate(`${item.publishDate} +0000`, 'DD/MM/YY ZZ') : undefined,
        description: item.description,
        category: item.contentTheme,
    }));

    // TODO: Add full text support

    return {
        title: 'PwC Strategy& - Sustainability Publications',
        link: baseUrl,
        language: feedLang,
        description: feedDescription,
        item: items,
    };
}
