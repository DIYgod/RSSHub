import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/trending/:filters?',
    name: 'Unknown',
    maintainers: ['nczitzk'],
    handler,
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
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}/${item.attr('data-article-id')}`,
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
                item.pubDate = parseDate(content('meta[name="citation_date"]').attr('content'));
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    authors: content('.authors-list').html(),
                    abs: content('#enc-abstract').html(),
                });

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
