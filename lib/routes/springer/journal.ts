import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { art } from '@/utils/render';

export const route: Route = {
    path: '/journal/:journal',
    categories: ['journal'],
    example: '/springer/journal/10450',
    parameters: { journal: 'Journal Code, the number in the URL from the journal homepage' },
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
            source: ['www.springer.com/journal/:journal/*'],
        },
    ],
    name: 'Journal',
    maintainers: ['Derekmini', 'TonyRL', 'xiahaoyun'],
    handler,
};

async function handler(ctx) {
    const host = 'https://link.springer.com';
    const journal = ctx.req.param('journal');
    const jrnlUrl = `${host}/journal/${journal}/volumes-and-issues`;

    const authorizeResponse = await ofetch.raw('https://idp.springer.com/authorize', {
        query: {
            response_type: 'cookie',
            client_id: 'springerlink',
            redirect_uri: jrnlUrl,
        },
        redirect: 'manual',
    });
    const authorizeCookie = authorizeResponse.headers
        .getSetCookie()
        .map((c) => c.split(';')[0])
        .join('; ');

    await ofetch(authorizeResponse.headers.get('location'), {
        headers: {
            cookie: authorizeCookie,
        },
        redirect: 'manual',
    });

    const response = await ofetch(jrnlUrl, {
        headers: {
            cookie: authorizeCookie,
        },
    });
    const $ = load(response);
    const jrnlName = $('span.app-journal-masthead__title').text().trim();
    const issueUrl = `${host}${$('li.c-list-group__item:first-of-type').find('a').attr('href')}`;

    const response2 = await ofetch(issueUrl, {
        headers: {
            cookie: authorizeCookie,
        },
    });
    const $2 = load(response2);
    const issue = $2('h2.app-journal-latest-issue__heading').text();
    const list = $2('ol.u-list-reset > li')
        .toArray()
        .map((item) => {
            const title = $(item).find('h3.app-card-open__heading').find('a').text().trim();
            const link = $(item).find('h3.app-card-open__heading').find('a').attr('href');
            const doi = link.replace('https://link.springer.com/article/', '');
            const img = $(item).find('img').attr('src');
            const authors = $(item)
                .find('li')
                .toArray()
                .map((item) => $(item).text().trim())
                .join('; ');
            return {
                title,
                link: link.startsWith('http') ? link : `${host}${link}`,
                doi,
                issue,
                img,
                authors,
            };
        });

    const renderDesc = (item) =>
        art(path.join(__dirname, 'templates/description.art'), {
            item,
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response3 = await ofetch(item.link, {
                    headers: {
                        cookie: authorizeCookie,
                    },
                });
                const $3 = load(response3);
                item.abstract = $3('div#Abs1-content > p:first-of-type').text();
                item.description = renderDesc(item);
                return item;
            })
        )
    );
    return {
        title: jrnlName,
        link: jrnlUrl,
        item: items,
    };
}
