import { load } from 'cheerio';

import type { Route } from '@/types';
import { config } from '@/config';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    name: 'Topic',
    maintainers: ['fredericky123'],
    path: '/topic/:fields/:values/:limit?',
    example: '/nber/topic/itm_topics_term_id/656',
    parameters: {
        fields: 'Facet field(s) from the topic page\'s listing API. For a taxonomy topic (`nber.org/taxonomy/term/<id>`) this is `itm_topics_term_id`. For a topic landing page (`nber.org/topics/<slug>`) copy the field segment from the page\'s `generic_listing` request, e.g. `nid,itm_topics_term_id`.',
        values: 'Facet value(s) matching the fields, e.g. `656`, or `11651,4701` for a multi-facet topic.',
        limit: 'Number of items to fetch, 50 by default.',
    },
    features: {
        supportScihub: true,
    },
    radar: [
        {
            source: ['nber.org/taxonomy/term/:id'],
            target: '/topic/itm_topics_term_id/:id',
        },
    ],
    handler,
    url: 'nber.org/research/topics',
    description: `Working papers and other research outputs under an NBER topic.

To find the parameters, open the topic page, then in DevTools › Network filter for \`generic_listing\` and read the path segments of
\`/api/v1/generic_listing/{fields}/{values}/_/_/search/contentType\`.

| Topic page | Route |
| ---------- | ----- |
| nber.org/taxonomy/term/656 | \`/nber/topic/itm_topics_term_id/656\` |
| nber.org/topics/entrepreneurship | \`/nber/topic/nid,itm_topics_term_id/11651,4701\` |`,
};

async function handler(ctx) {
    const { fields, values, limit = '50' } = ctx.req.param();
    const baseUrl = 'https://www.nber.org';

    const apiUrl = `${baseUrl}/api/v1/generic_listing/${fields}/${values}/_/_/search/contentType?page=1&perPage=${limit}`;

    const results = await cache.tryGet(apiUrl, async () => (await ofetch(apiUrl)).results, config.cache.routeExpire, false);

    const items = await Promise.all(
        results.map((article) => {
            const link = `${baseUrl}${article.url}`;
            const listingAuthors = Array.isArray(article.authors) ? article.authors.map((a) => a.replace(/<[^>]+>/g, '').trim()).join(', ') : undefined;

            return cache.tryGet(link, async () => {
                let description = article.abstract ?? '';
                let author = listingAuthors;
                let doi;

                try {
                    const $ = load(await ofetch(link));
                    const fullAbstract = $('.page-header__intro-inner').html();
                    const pdf = $('meta[name="citation_pdf_url"]').attr('content');

                    if (fullAbstract) {
                        description = fullAbstract;
                    }
                    if (pdf) {
                        description += `<p><a href="${pdf}">Download PDF</a></p>`;
                    }
                    author = author || $('meta[name="dcterms.creator"]').attr('content');
                    doi = $('meta[name="citation_doi"]').attr('content');
                } catch {
                    // Non-paper pages (projects, articles, books) may not expose these
                    // meta tags; fall back to the data already provided by the listing API.
                }

                return {
                    title: article.title,
                    link,
                    description,
                    author,
                    doi,
                    category: article.displaytypename,
                    pubDate: article.displaydate ? parseDate(article.displaydate) : undefined,
                };
            });
        })
    );

    const lastValue = values.split(',').pop();

    return {
        title: `NBER - Topic ${values}`,
        link: `${baseUrl}/taxonomy/term/${lastValue}`,
        item: items,
        description: `National Bureau of Economic Research outputs under topic ${values}`,
    };
}
