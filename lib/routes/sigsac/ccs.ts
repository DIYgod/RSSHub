import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const url = 'https://www.sigsac.org/';
// https://www.sigsac.org/ccs/CCS2022/program/accepted-papers.html

export const route: Route = {
    path: '/ccs',
    categories: ['journal'],
    example: '/sigsac/ccs',
    radar: [
        {
            source: ['sigsac.org/ccs.html', 'sigsac.org/'],
        },
    ],
    name: 'The ACM Conference on Computer and Communications Security',
    maintainers: ['ZeddYu'],
    handler,
    url: 'sigsac.org/ccs.html',
    description: 'Return results from 2020',
};

async function handler() {
    const last = new Date().getFullYear() + 1;
    const yearList = Array.from({ length: last - 2020 }, (_, v) => `${url}ccs/CCS${v + 2020}/`);
    const yearResponses = await Promise.allSettled(yearList.map((url) => ofetch(url)));

    const urlList = yearResponses
        .map((response, i) => {
            const $ = load(response.value);
            const href = $('a:contains("Accepted Papers")').attr('href');
            return href && new URL($('a:contains("Accepted Papers")').attr('href')!, yearList[i]).href;
        })
        .filter(Boolean);

    const responses = await Promise.allSettled(urlList.map((url) => ofetch(url)));

    const items = responses.flatMap((response, i) => {
        const $ = load(response.value);
        const link = urlList[i];
        const paperSection = $('div.papers-item')
            .toArray()
            .map((item) => {
                item = $(item);
                const title = item.find('b').text().trim();
                return {
                    title,
                    author: item.find('p').text().trim().replaceAll('\n', '').replaceAll(/\s+/g, ' '),
                    link: `${link}#${title}`,
                    pubDate: parseDate(link.match(/CCS(\d{4})/)[1], 'YYYY'),
                };
            });
        const paperTable = $('tbody tr')
            .toArray()
            .slice(1) // skip table header
            .map((item) => {
                item = $(item);
                const title = item.find('td').eq(0).text().trim();
                return {
                    title,
                    author: item.find('td').eq(1).text().trim().replaceAll('\n', '').replaceAll(/\s+/g, ' '),
                    link: `${link}#${title}`,
                    pubDate: parseDate(link.match(/CCS(\d{4})/)[1], 'YYYY'),
                };
            });
        return paperSection.length ? paperSection : paperTable;
    });

    return {
        title: 'ACM CCS',
        link: url,
        description: 'The ACM Conference on Computer and Communications Security (CCS) Accepted Papers',
        allowEmpty: true,
        item: items,
    };
}
