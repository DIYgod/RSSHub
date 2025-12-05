import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://github.com';

export const route: Route = {
    path: '/wiki/:user/:repo/:page?',
    categories: ['programming'],
    example: '/github/wiki/flutter/flutter/Roadmap',
    parameters: { user: 'User / Org name', repo: 'Repo name', page: 'Page slug, can be found in URL, empty means Home' },
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
            source: ['github.com/:user/:repo/wiki/:page/_history', 'github.com/:user/:repo/wiki/:page', 'github.com/:user/:repo/wiki/_history', 'github.com/:user/:repo/wiki'],
            target: '/wiki/:user/:repo/:page',
        },
    ],
    name: 'Wiki History',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { user, repo, page } = ctx.req.param();

    let url = `${baseUrl}/${user}/${repo}/wiki${page ? `/${page}` : ''}/_history`;

    // Fetch page slug. History fetched with no page specified has no <a> tag for commit.
    if (!page) {
        const { data } = await got(`${baseUrl}/${user}/${repo}/wiki`);
        const $ = load(data);

        url = `${baseUrl}${$('a[href$=_history]').attr('href')}`;
    }

    const { data } = await got(url);
    const $ = load(data);

    const items = $('.js-wiki-history-revision')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.h5').text(),
                author: item.find('.mt-1 a').text(),
                pubDate: parseDate(item.find('relative-time').attr('datetime')),
                link: `${baseUrl}${item.find('.text-mono a').attr('href')}`,
            };
        });

    return {
        title: `${$('.gh-header-title').text()} - ${user}/${repo}`,
        link: url,
        item: items,
    };
}
