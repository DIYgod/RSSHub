import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const url = 'https://www.ieee-security.org/';
// https://www.ieee-security.org/TC/SP2023/program-papers.html

export const route: Route = {
    path: '/security-privacy',
    categories: ['journal'],
    example: '/ieee-security/security-privacy',
    radar: [
        {
            source: ['ieee-security.org/TC/SP-Index.html', 'ieee-security.org/'],
            target: '/security-privacy',
        },
        {
            source: [
                'www.ieee-security.org/TC/SP-Index.html',
                'www.ieee-security.org/',
                'www.ieee-security.org/TC/SP2020/program-papers.html',
                'www.ieee-security.org/TC/SP2021/program-papers.html',
                'www.ieee-security.org/TC/SP2022/program-papers.html',
                'www.ieee-security.org/TC/SP2023/program-papers.html',
            ],
            target: '/security-privacy',
        },
        { source: ['sp2023.ieee-security.org/program-papers.html'], target: '/security-privacy' },
        { source: ['sp2024.ieee-security.org/accepted-papers.html'], target: '/security-privacy' },
        { source: ['sp2025.ieee-security.org/accepted-papers.html'], target: '/security-privacy' },
        { source: ['sp2026.ieee-security.org/accepted-papers.html'], target: '/security-privacy' },
    ],
    name: 'IEEE Symposium on Security and Privacy',
    maintainers: ['ZeddYu'],
    handler,
    url: 'ieee-security.org/TC/SP-Index.html',
    description: 'Return results from 2020',
};

async function handler() {
    const indexUrl = new URL('TC/SP-Index.html', url).href;
    const response = await ofetch<string>(indexUrl);
    const $ = load(response);
    const conferences = $('td a')
        .toArray()
        .filter((element) => $(element).text() === 'SP Conference Information')
        .map((element) => ({
            year: Number($(element).closest('td').find('b').first().text()),
            link: new URL($(element).attr('href')!, indexUrl).href,
        }))
        .filter((conference) => conference.year >= 2020 && conference.year <= new Date().getFullYear());

    const items = await pMap(conferences, fetchPapers, { concurrency: 3 });

    return {
        title: 'S&P',
        link: indexUrl,
        description: 'IEEE Symposium on Security and Privacy Accepted Papers',
        item: items.flat(),
    };
}

async function fetchPapers(conference: { year: number; link: string }) {
    return await cache.tryGet(conference.link, async () => {
        const homeResponse = await ofetch<string>(conference.link);
        const home = load(homeResponse);
        const paperPath = home('a[href="accepted-papers.html"], a[href="program-papers.html"]').first().attr('href');
        if (!paperPath) {
            throw new Error(`S&P ${conference.year} does not provide an accepted papers page`);
        }
        const paperUrl = new URL(paperPath, conference.link).href;
        const response = await ofetch<string>(paperUrl);
        const $ = load(response);
        const pageYear = Number(
            $('title')
                .text()
                .match(/Security and Privacy (\d{4})/)?.[1]
        );
        if (pageYear !== conference.year) {
            throw new Error(`S&P ${conference.year} returned a papers page for ${pageYear || 'an unknown year'}`);
        }
        // New sites group accepted papers by cycle; older archives use panels.
        return $('.tab-content .list-group-item, div.panel-body > div.list-group-item')
            .toArray()
            .filter((element) => $(element).find('b').first().text().trim() !== 'TBD')
            .map((element) => {
                const item = $(element);
                const title = item.find('b').first().text();
                const anchor = item.find('b a[href^="#"]').first().attr('href');
                const authors = item.find('.authorlist');
                const authorNodes = authors.contents().toArray();
                const authorEnd = authorNodes.findIndex((node) => $(node).is('br'));
                const author = authors.length
                    ? authorNodes
                          .slice(0, authorEnd === -1 ? undefined : authorEnd)
                          .filter((node) => !$(node).is('sup'))
                          .map((node) => $(node).text())
                          .join('')
                    : item
                          .contents()
                          .slice(2)
                          .toArray()
                          .map((node) => $(node).text())
                          .join('');
                return {
                    title,
                    author: author.trim(),
                    link: `${paperUrl}${anchor ?? `#${encodeURIComponent(title.trim())}`}`,
                    pubDate: parseDate(`${conference.year}-01-01T00:00:00Z`),
                };
            });
    });
}
