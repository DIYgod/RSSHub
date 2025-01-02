import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:id',
    categories: ['journal'],
    example: '/annualreviews/anchem',
    parameters: { id: 'Journal id, can be found in URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: true,
    },
    radar: [
        {
            source: ['annualreviews.org/journal/:id', 'annualreviews.org/'],
        },
    ],
    name: 'Journal',
    maintainers: ['nczitzk'],
    handler,
    description: `The URL of the journal [Annual Review of Analytical Chemistry](https://www.annualreviews.org/journal/anchem) is \`https://www.annualreviews.org/journal/anchem\`, where \`anchem\` is the id of the journal, so the route for this journal is \`/annualreviews/anchem\`.

::: tip
  More jounals can be found in [Browse Journals](https://www.annualreviews.org/action/showPublications).
:::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const rootUrl = 'https://www.annualreviews.org';
    const apiRootUrl = `https://api.crossref.org`;
    const feedUrl = `${rootUrl}/r/${id}_rss`;
    const currentUrl = `${rootUrl}/toc/${id}/current`;

    const response = await got({
        method: 'get',
        url: feedUrl,
    });

    const $ = load(response.data);

    let items = $('entry')
        .toArray()
        .map((item) => {
            item = $(item);

            const doi = item.find('id').text().split('doi=').pop();

            return {
                doi,
                guid: doi,
                title: item.find('title').text(),
                link: item.find('link').attr('href').split('?')[0],
                description: item.find('content').text(),
                pubDate: parseDate(item.find('published').text()),
                author: item
                    .find('author name')
                    .toArray()
                    .map((a) => $(a).text())
                    .join(', '),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.guid, async () => {
                const apiUrl = `${apiRootUrl}/works/${item.doi}`;

                const detailResponse = await got({
                    method: 'get',
                    url: apiUrl,
                });

                item.description = detailResponse.data.message.abstract.replaceAll('jats:p>', 'p>');

                return item;
            })
        )
    );

    return {
        title: $('title')
            .first()
            .text()
            .replace(/: Table of Contents/, ''),
        description: $('subtitle').first().text(),
        link: currentUrl,
        item: items,
        language: $('html').attr('lang'),
    };
}
