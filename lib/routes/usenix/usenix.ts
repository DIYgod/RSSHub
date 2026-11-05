import { type Cheerio, load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const url = 'https://www.usenix.org';
const seasons = ['spring', 'summer', 'fall', 'winter'];
async function settle<T>(promise: Promise<T>): Promise<PromiseSettledResult<T>> {
    const [result] = await Promise.allSettled([promise]);
    return result;
}
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
    const category = mapElements(content.find('.field-name-field-paper-sub-type .field-item'), (_, el) => $(el).text());
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
                description: $item.find('.field-name-field-paper-description-long').html() ?? undefined,
                link: new URL($item.find('h2 > a').attr('href')!, url).href,
                author: $item.find('div.field.field-name-field-paper-people-text.field-type-text-long.field-label-hidden p').text(),
                category: $item.find('.field-name-field-paper-sub-type .field-item').length ? mapElements($item.find('.field-name-field-paper-sub-type .field-item'), (_, el) => $(el).text()) : undefined,
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
    return [...new Set(mapElements($('a[href]'), (_, element) => new URL($(element).attr('href')!, conferenceUrl).href))].filter((link) => {
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
    const last = new Date().getFullYear() + 1;
    const conferenceUrls = Array.from({ length: last - 2020 }, (_, v) => `${url}/conference/usenixsecurity${v + 20}`);
    const urlList = conferenceUrls.flatMap((url) => seasons.map((season) => `${url}/${season}-accepted-papers`));
    const responses = await pMap(urlList, (url) => settle(fetchAcceptedPapers(url)), { concurrency: 3 });
    const historicalLists = responses.map((response) => parseAcceptedPapers(response.status === 'fulfilled' ? response.value : undefined));
    const missingConferences = conferenceUrls.filter((_, index) => historicalLists.slice(index * seasons.length, (index + 1) * seasons.length).every((papers) => !papers.length));
    const linkedPages = (await pMap(missingConferences, getAcceptedPaperUrls, { concurrency: 3 })).flat();
    const additionalUrls = [...new Set(linkedPages)].filter((link) => !urlList.includes(link));
    const additionalResponses = await pMap(additionalUrls, fetchAcceptedPapers, { concurrency: 3 });
    const list = new Map([...historicalLists.flat(), ...additionalResponses.flatMap((response) => parseAcceptedPapers(response))].map((item) => [item.link, item])).values().toArray();
    const items = await pMap(
        list,
        (item) => {
            const detailsPromise = cache.tryGet(`usenix:security:paper:${item.link}`, () => getPaperDetails(item.link!));
            const mergedPromise = mapResolvedValue(detailsPromise, (details): DataItem => ({ ...item, ...details, description: details.description ?? item.description, category: item.category ?? details.category }));
            return settle(recoverFailure(mergedPromise, () => item));
        },
        {
            concurrency: 3,
        }
    );
    return {
        title: 'USENIX',
        link: url,
        description: 'USENIX Security Symposium Accpeted Papers',
        item: items.filter((r): r is PromiseFulfilledResult<DataItem> => r.status === 'fulfilled').map((r) => r.value),
    };
}
async function mapResolvedValue<T, U>(promise: Promise<T>, mapper: (value: T) => U | Promise<U>): Promise<U> {
    const value = await promise;
    return mapper(value);
}
function mapElements<T, U>(selection: Cheerio<T>, mapper: (index: number, node: T) => U | U[] | null | undefined): U[] {
    return selection.toArray().flatMap((node, index) => mapper(index, node) ?? []);
}
async function recoverFailure<T, U>(promise: Promise<T>, recover: () => U | Promise<U>): Promise<T | U> {
    try {
        return await promise;
    } catch {
        return recover();
    }
}
