import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

const url = 'https://www.usenix.org';
const seasons = ['spring', 'summer', 'fall', 'winter'];
async function fetchAcceptedPapers(url: string) {
    try {
        return await ofetch<string>(url);
    } catch {
        // Some historical conference seasons are unavailable.
        return;
    }
}
async function getPaperDetails(link: string): Promise<Pick<DataItem, 'description' | 'pubDate' | 'category'>> {
    const response = await ofetch(link);
    const $ = load(response);
    const published = $('meta[property="article:published_time"]').attr('content');
    const pubDate = published ? parseDate(published) : undefined;
    const content = $('article.node-paper > .content');
    const category = content
        .find('.field-name-field-paper-sub-type .field-item')
        .toArray()
        .map((el) => $(el).text());
    content
        .find(
            '.field-name-field-paper-people-text, .field-name-field-paper-people, .field-name-field-paper-sub-type, .bibtex-text-entry, .group-open-access-content > .description, .group-open-access-content > h2:not(.field), script, style, noscript'
        )
        .remove();
    const description = content.html();
    const paperCategory = category.length ? category : undefined;
    return { description, pubDate, category: paperCategory };
}
function parseAcceptedPapers(response?: string): DataItem[] {
    if (!response) {
        return [];
    }
    const $ = load(response);
    return $('article.node-paper')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.find('h2 > a').text(),
                description: $item.find('.field-name-field-paper-description-long').html(),
                link: new URL($item.find('h2 > a').attr('href')!, url).href,
                author: $item.find('div.field.field-name-field-paper-people-text.field-type-text-long.field-label-hidden p').text(),
                category: $item.find('.field-name-field-paper-sub-type .field-item').length
                    ? $item
                          .find('.field-name-field-paper-sub-type .field-item')
                          .toArray()
                          .map((el) => $(el).text())
                    : undefined,
            };
        });
}
async function getAcceptedPaperUrls(conferenceUrl: string): Promise<string[]> {
    const response = await fetchAcceptedPapers(conferenceUrl);
    if (!response) {
        return [];
    }
    const $ = load(response);
    const conferencePath = new URL(conferenceUrl).pathname;
    const links = $('a[href]')
        .toArray()
        .map((element) => new URL($(element).attr('href')!, conferenceUrl).href);
    return [...new Set(links)].filter((link) => {
        const parsed = new URL(link);
        return parsed.origin === url && parsed.pathname.startsWith(`${conferencePath}/`) && parsed.pathname.endsWith('-accepted-papers');
    });
}
export const route: Route = {
    path: '/usenix-security-sympoium',
    categories: ['journal'],
    example: '/usenix/usenix-security-sympoium',
    radar: [
        {
            source: ['usenix.org/conferences/all', 'usenix.org/conferences', 'usenix.org/'],
        },
    ],
    name: 'Security Symposia',
    maintainers: ['ZeddYu'],
    handler,
    url: 'usenix.org/conferences/all',
    description: 'Return results from 2020',
};
async function handler() {
    const last = Temporal.Now.zonedDateTimeISO('UTC').year + 1;
    const conferenceUrls = Array.from({ length: last - 2020 }, (_, v) => `${url}/conference/usenixsecurity${v + 20}`);
    const urlList = conferenceUrls.flatMap((url) => seasons.map((season) => `${url}/${season}-accepted-papers`));
    const responses = await pMap(urlList, (url) => fetchAcceptedPapers(url), { concurrency: 3 });
    const historicalLists = responses.map((response) => parseAcceptedPapers(response));
    const missingConferences = conferenceUrls.filter((_, index) => historicalLists.slice(index * seasons.length, (index + 1) * seasons.length).every((papers) => !papers.length));
    const linkedPages = (await pMap(missingConferences, getAcceptedPaperUrls, { concurrency: 3 })).flat();
    const additionalResponses = await pMap(linkedPages, fetchAcceptedPapers, { concurrency: 3 });
    const list = [...historicalLists.flat(), ...additionalResponses.flatMap((response) => parseAcceptedPapers(response))];
    const items = await pMap(
        list,
        async (item): Promise<DataItem> => {
            try {
                const details = await cache.tryGet(`usenix:security:paper:${item.link}`, () => getPaperDetails(item.link!));
                return { ...item, ...details, description: details.description ?? item.description, category: item.category ?? details.category };
            } catch {
                return item;
            }
        },
        {
            concurrency: 3,
        }
    );
    return {
        title: 'USENIX',
        link: url,
        description: 'USENIX Security Symposium Accpeted Papers',
        item: items,
    };
}
