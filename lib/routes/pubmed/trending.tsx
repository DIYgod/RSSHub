import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/trending/:filters?',
    categories: ['journal'],
    example: '/pubmed/trending',
    parameters: { filters: 'Filters, can be found in URL' },
    name: 'Trending articles',
    maintainers: ['y9c', 'nczitzk'],
    handler,
    description: `::: tip
For the parameter **filter**, the \`filter\` parameter in the URL should be split into a string by \`,\`, here is an example.

In \`https://pubmed.ncbi.nlm.nih.gov/trending/?filter=simsearch1.fha&filter=pubt.clinicaltrial&filter=pubt.randomizedcontrolledtrial\`, the filter parameters are \`simsearch1.fha\`, \`pubt.clinicaltrial\`, and \`pubt.randomizedcontrolledtrial\`. Therefore, the filter corresponding to the route should be filled with \`simsearch1.fha,pubt.clinicaltrial,pubt.randomizedcontrolledtrial\`, and the route is [\`/pubmed/trending/simsearch1.fha,pubt.clinicaltrial,pubt.randomizedcontrolledtrial\`](https://rsshub.app/pubmed/trending/simsearch1.fha,pubt.clinicaltrial,pubt.randomizedcontrolledtrial)
:::`,
};

async function handler(ctx) {
    const filters = ctx.req.param('filters');

    const rootUrl = 'https://pubmed.ncbi.nlm.nih.gov';
    const currentUrl = `${rootUrl}/trending${filters ? `?filter=${filters.replaceAll(',', '&filter=')}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('a[data-article-id]')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);

            return {
                title: $item.text(),
                link: `${rootUrl}/${$item.attr('data-article-id')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.doi = content('meta[name="citation_doi"]').attr('content');
                item.pubDate = parseDate(content('meta[name="citation_date"]').attr('content')!);
                item.description = renderToString(
                    <>
                        {content('.authors-list').html() ? raw(content('.authors-list').html()) : null}
                        <br />
                        {content('#enc-abstract').html() ? raw(content('#enc-abstract').html()) : null}
                    </>
                );

                return item;
            })
        )
    );

    return {
        title: 'Trending page - PubMed',
        link: currentUrl,
        item: items,
    };
}
