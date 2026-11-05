import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.imf.org';
const searchUrl = `${rootUrl}/en/publications/search`;
const organizationId = 'imfproduction561s308u';
// Public search API key from https://www.imf.org/en/publications/search (COVEO client configuration).
const accessToken = 'xx742a6c66-f427-4f5a-ae1e-770dc7264e8a';

interface SearchResponse {
    results: Array<{
        title: string;
        clickUri: string;
        raw: {
            imfdate?: number;
            imfdescription?: string;
            imfauthor?: string[];
            author?: string;
            imfkeywords?: string[];
        };
    }>;
}

export const route: Route = {
    path: '/country-reports/:country?',
    categories: ['finance'],
    example: '/imf/country-reports/Germany',
    name: 'Staff Country Reports',
    maintainers: ['DIYgod'],
    parameters: {
        country: {
            description: 'Official country name in the Country search filter. Omit to subscribe to all countries.',
            options: [
                { value: 'Germany', label: 'Germany' },
                { value: 'United Kingdom', label: 'United Kingdom' },
                { value: "China, People's Republic of", label: 'China' },
                { value: 'France', label: 'France' },
                { value: 'United States', label: 'United States' },
                { value: 'Japan', label: 'Japan' },
                { value: "Hong Kong Special Administrative Region, People's Republic of China", label: 'Hong Kong' },
            ],
        },
    },
    description: 'Latest Staff Country Reports, including Article IV consultations, Selected Issues, and financial sector assessments. Items contain the official report abstract and link to the publication page.',
    radar: [{ source: ['www.imf.org/en/publications/search'], target: '/country-reports' }],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const country = ctx.req.param('country');
    const data = await cache.tryGet<SearchResponse>(`imf:country-reports:${country ?? ''}`, () =>
        ofetch(`https://${organizationId}.org.coveo.com/rest/search/v2`, {
            method: 'POST',
            headers: { authorization: `Bearer ${accessToken}` },
            body: {
                searchHub: 'Search',
                q: '',
                aq: '(@imflanguage=="ENG") AND (@syslanguage=="ENGLISH")',
                cq: `@source=="IMF-ORG" @templatename=="Issue Page" @imfcontenttype=="PUBS|COUNTRYREPS"${country ? ` @imfformalcountry==${JSON.stringify(country)}` : ''}`,
                sortCriteria: '@imfdate descending',
                numberOfResults: 10,
                firstResult: 0,
                fieldsToInclude: ['imfdate', 'imfdescription', 'imfauthor', 'author', 'imfkeywords'],
                locale: 'en',
                timezone: 'UTC',
                enableQuerySyntax: false,
            },
        })
    );

    return {
        title: `IMF - Staff Country Reports${country ? ` - ${country}` : ''}`,
        link: `${searchUrl}#sortCriteria=%40imfdate%20descending&cf-type=COUNTRYREPS${country ? `&f-country=${encodeURIComponent(country)}` : ''}`,
        language: 'en',
        item: data.results.map((item) => ({
            title: item.title,
            link: item.clickUri,
            description: item.raw.imfdescription,
            pubDate: item.raw.imfdate ? parseDate(item.raw.imfdate) : undefined,
            author: item.raw.imfauthor?.join('; ') || item.raw.author,
            category: item.raw.imfkeywords?.flatMap((keywords) => keywords.split(',').map((keyword) => keyword.trim())),
        })),
    };
}
