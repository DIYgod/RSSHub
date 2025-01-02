import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { decodeCFEmail } from './cf-email';

export const route: Route = {
    path: '/journal/:id',
    categories: ['journal'],
    example: '/sciencedirect/journal/research-policy',
    parameters: { id: 'Journal id, can be found in URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['sciencedirect.com/journal/:id', 'sciencedirect.com/'],
        },
    ],
    name: 'Journal',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const rootUrl = 'https://www.sciencedirect.com';
    const currentUrl = `${rootUrl}/journal/${id}/articles-in-press`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const issn = response.data.match(/ISSN(\w{8})'/)[1];

    const apiUrl = `${rootUrl}/journal/${issn}/articles-in-press/articles?path=/journal/${id}/articles-in-press&title=${id}`;

    const apiResponse = await got({
        method: 'get',
        url: apiUrl,
        headers: {
            cookie: response.headers['set-cookie'].map((cookie) => cookie.split(';Version=1;')[0]).join('; '),
        },
    });

    const list = apiResponse.data.data.results.map((item) => ({
        doi: item.doi,
        title: item.title,
        link: `${rootUrl}${item.href}`,
        pubDate: parseDate(item.coverDateStart),
        enclosure_url: `${rootUrl}${item.pdfDownload.url}`,
        author: item.authors.map((author) => `${author.givenName} ${author.surname}`).join(', '),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('a.__cf_email__').each((_, e) => {
                    e = content(e);
                    e.after(decodeCFEmail(e.attr('data-cfemail')));
                    e.remove();
                });

                const abstracts = content('.Abstracts').html() ?? '';
                const keywords = content('.Keywords').html() ?? '';

                item.description = abstracts + keywords;

                return item;
            })
        )
    );

    return {
        title: `${response.data.match(/\\"displayName\\":\\"(.*?)\\",\\"/)[1]} - ScienceDirect`,
        link: currentUrl,
        item: items,
    };
}
