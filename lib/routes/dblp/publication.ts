import { setTimeout } from 'node:timers/promises';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:field',
    categories: ['study'],
    example: '/dblp/knowledge%20tracing',
    parameters: { field: 'Research field' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            // Search keywords are query parameters, not arbitrary path segments.
            source: ['dblp.org/search'],
        },
    ],
    name: 'Keyword Search',
    maintainers: ['ytno1'],
    handler,
};

const cookieOf = (headers: Headers) =>
    headers
        .getSetCookie()
        .map((c) => c.split(';', 1)[0])
        .join('; ');

async function handler(ctx) {
    const field = ctx.req.param('field');
    const link = new URL('https://dblp.org/search');
    link.searchParams.set('q', field);

    const apiUrl = new URL('https://dblp.org/search/publ/api');
    apiUrl.search = new URLSearchParams({ q: field, format: 'json', h: '10' }).toString();
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    };
    const first = await ofetch.raw(apiUrl.href, { headers });
    let response = first._data;
    const challengeData = typeof response === 'string' ? response.match(/<script id="anubis_challenge" type="application\/json">(.*?)<\/script>/s)?.[1] : undefined;
    if (challengeData) {
        const { challenge } = JSON.parse(challengeData);
        await setTimeout((challenge.difficulty + 1) * 1000);
        const passUrl = new URL('https://dblp.org/.within.website/x/cmd/anubis/api/pass-challenge');
        passUrl.search = new URLSearchParams({ redir: apiUrl.pathname + apiUrl.search, challenge: challenge.randomData, id: challenge.id }).toString();
        const pass = await ofetch.raw(passUrl.href, {
            headers: {
                cookie: cookieOf(first.headers),
            },
            redirect: 'manual',
            ignoreResponseError: true,
        });
        response = await ofetch(apiUrl.href, {
            headers: {
                ...headers,
                cookie: cookieOf(pass.headers),
            },
        });
    }
    if (!response?.result?.hits) {
        throw new Error('DBLP did not return publication search data. The source may be showing an anti-bot challenge.');
    }
    const {
        result: { hits },
    } = response;
    const { hit: data = [] } = hits;

    const list = data.map((item) => {
        const { info } = item;
        const { authors, title, venue, year, type, doi, ee } = info;

        const authorList = authors?.author ? (Array.isArray(authors.author) ? authors.author : [authors.author]) : [];

        return {
            title,
            link: ee,
            author: authorList.length ? authorList.map((author) => ({ name: author.text })) : undefined,
            doi,
            description: `Year: ${year ?? 'unknown'}, Venue: ${venue}, Type: ${type}, Doi: ${doi}`,
        };
    });

    return {
        title: `【dblp】${field}`,
        link: link.href,
        description: `DBLP ${field} RSS`,
        item: list,
    };
}
