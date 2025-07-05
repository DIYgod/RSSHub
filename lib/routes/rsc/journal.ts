import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/journal/:id/:category?',
    categories: ['journal'],
    example: '/rsc/journal/ta',
    parameters: { id: 'Journal id, can be found in URL', category: 'Category, see below, All Recent Articles by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Journal',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
  All journals at [Current journals](https://pubs.rsc.org/en/journals)
:::

| All Recent Articles | Advance Articles |
| ------------------- | ---------------- |
| allrecentarticles   | advancearticles  |`,
};

async function handler(ctx) {
    const { id, category = 'allrecentarticles' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const rootUrl = 'https://pubs.rsc.org';
    const currentUrl = new URL(`en/journals/journalissues/${id}#!recentarticles`, rootUrl).href;
    const apiUrl = new URL('en/journals/getrecentarticles', rootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        form: {
            name: id,
            pageno: 1,
            iscontentavailable: true,
            category,
        },
    });

    let $ = load(response);

    $('div.capsule__article-image').each(function () {
        $(this).replaceWith(
            art(path.join(__dirname, 'templates/image.art'), {
                image: $(this).find('img').prop('data-original'),
            })
        );
    });

    let items = $('div.capsule--article')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const authors = item.find('div.article__authors').text().trim();
            const doi = item.find('div.text--small span a').text().split(/org\//).pop();

            const isOpenAccess = !!item.find('span.capsule__context img.ver-t').prop('alt');
            const isManuscript = !!item.find('span.capsule__context span').text();

            const enclosureUrl = new URL(item.find('div.capsule__action--buttons a').prop('href').split('?').pop(), rootUrl).href;

            return {
                title: item.find('h3.capsule__title').text(),
                link: new URL(item.find('a.capsule__action').prop('href'), rootUrl).href,
                description: item.find('div.capsule__column-wrapper').html(),
                author: authors,
                category: [item.find('span.capsule__context').text().trim(), ...authors.split(/,\s|and\s/), isOpenAccess || isManuscript],
                guid: `rsc-${doi}`,
                pubDate: timezone(parseDate(item.find('div.text--small span.block').text().split(/on\s/).pop(), 'DD MMM YYYY'), +1),
                enclosure_url: enclosureUrl,
                enclosure_type: enclosureUrl ? 'application/pdf' : undefined,
                doi,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.guid, async () => {
                if (item.category.pop()) {
                    const { data: detailResponse } = await got(item.link.replace(/\/articlelanding\//, '/articlehtml/'));

                    const content = load(detailResponse);

                    content('#pnlArticleAccess, #pnlArticleContent').remove();
                    content('div.abstract, div.article-abstract__heading').prevAll().remove();

                    item.title = content('meta[name="DC.title"]').prop('content');
                    item.description = content('#wrapper, article.article-control').html();
                    item.pubDate = timezone(parseDate(content('meta[name="citation_online_date"]').prop('content'), 'YYYY/MM/DD'), +1);
                    item.enclosure_url = content('meta[name="citation_pdf_url"]').prop('content');
                    item.enclosure_type = item.enclosure_url ? 'application/pdf' : undefined;
                    item.doi = content('meta[name="DC.Identifier"]').prop('content');
                }

                return item;
            })
        )
    );

    const { data: detailResponse } = await got(currentUrl);

    $ = load(detailResponse);

    const icon = new URL($('link[rel="apple-touch-icon"]').prop('href'), rootUrl).href;

    return {
        item: items,
        title: $('meta[name="citation_title"]').prop('content'),
        link: currentUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: 'en',
        image: new URL($('div.page-head__cell--image span img').prop('src'), rootUrl).href,
        icon,
        logo: icon,
        subtitle: $('title').text(),
        author: $('meta[name="citation_journal_abbrev"]').prop('content'),
        allowEmpty: true,
    };
}
