// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    let id = ctx.req.param('id');

    const rootUrl = 'https://www.aeaweb.org';
    const currentUrl = `${rootUrl}/journals/${id}`;

    let response = await got({
        method: 'get',
        url: currentUrl,
    });

    let $ = load(response.data);

    $('.read-more').remove();

    id = $('input[name="journal"]').attr('value');

    const title = $('.page-title').text();
    const description = $('.intro-copy').text();
    const searchUrl = `${rootUrl}/journals/search-results?journal=${id}&ArticleSearch[current]=1`;

    response = await got({
        method: 'get',
        url: searchUrl,
    });

    $ = load(response.data);

    let items = $('h4.title a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: `${rootUrl}${item.attr('href').split('&')[0]}`,
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

                item.guid = item.doi;
                item.title = content('meta[name="citation_title"]').attr('content');
                item.author = content('.author')
                    .toArray()
                    .map((a) => content(a).text().trim())
                    .join(', ');
                item.pubDate = parseDate(content('meta[name="citation_publication_date"]').attr('content'), 'YYYY/MM');
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    description: content('meta[name="twitter:description"]')
                        .attr('content')
                        .replace(/\(\w+ \d+\)( - )?/, ''),
                });

                return item;
            })
        )
    );

    ctx.set('data', {
        title,
        description,
        link: currentUrl,
        item: items,
    });
};
