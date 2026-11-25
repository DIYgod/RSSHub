import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

interface Breach {
    Id: number;
    Name: string;
    Title: string;
    Description: string;
    AddedDate: string;
    ModifiedDate: string;
}

interface BreachCatalogue {
    breaches: Breach[];
    payload: string;
}

function getBreaches($: CheerioAPI): BreachCatalogue {
    const payload = $('script:contains("self.__next_f.push")')
        .toArray()
        .flatMap((script) => {
            const match = $(script)
                .text()
                .match(/^self\.__next_f\.push\(([\s\S]*)\);?$/);
            if (!match) {
                return [];
            }
            const chunk = JSON.parse(match[1]);
            return chunk[0] === 1 && typeof chunk[1] === 'string' ? [chunk[1]] : [];
        })
        .join('');
    const row = payload.match(/[0-9a-f]+:(\["\$","\$L[0-9a-f]+",null,\{"allBreaches":[^\n]+)/);
    if (!row) {
        throw new Error('Mozilla Monitor did not provide its public breach catalogue.');
    }
    const breaches = JSON.parse(row[1])[3].allBreaches;
    return { breaches, payload };
}

function getDescription(description: string, payload: string): string {
    if (!/^\$[0-9a-f]+$/.test(description)) {
        return description;
    }
    const record = payload.match(new RegExp(`${description.slice(1)}:T([0-9a-f]+),`));
    if (!record) {
        throw new Error('Mozilla Monitor did not provide the referenced breach description.');
    }
    // Flight text records specify their length in UTF-8 bytes.
    return Buffer.from(payload.slice(record.index! + record[0].length))
        .subarray(0, Number.parseInt(record[1], 16))
        .toString();
}

export const route: Route = {
    path: '/breaches',
    categories: ['other'],
    example: '/firefox/breaches',
    parameters: {},
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
            source: ['monitor.firefox.com/', 'monitor.firefox.com/breaches'],
            target: '/breaches',
        },
        {
            source: ['monitor.mozilla.org/', 'monitor.mozilla.org/en', 'monitor.mozilla.org/:lang/breaches', 'monitor.mozilla.org/:lang/breach-details/:name'],
            target: '/breaches',
        },
    ],
    name: 'Firefox Monitor',
    maintainers: ['TonyRL'],
    handler,
    url: 'monitor.mozilla.org/en/breaches',
};

async function handler() {
    const baseUrl = 'https://monitor.mozilla.org';
    const response = await got(`${baseUrl}/en/breaches`, { headers: { 'user-agent': 'RSSHub' } });
    const $ = load(response.data);
    const { breaches, payload } = getBreaches($);
    const categories = new Map(
        $('ul[class$="_breachList"] a[href*="/breach-details/"]')
            .toArray()
            .map((card) => [
                decodeURIComponent($(card).attr('href')!.split('/').pop()!),
                $(card)
                    .find('dl > div')
                    .last()
                    .find('dd')
                    .text()
                    .split(',')
                    .map((value) => value.trim()),
            ])
    );
    const items = breaches.map((breach) => ({
        title: breach.Title,
        description: getDescription(breach.Description, payload),
        link: `${baseUrl}/en/breach-details/${encodeURIComponent(breach.Name)}`,
        guid: String(breach.Id),
        pubDate: parseDate(breach.AddedDate.slice(2)),
        updated: parseDate(breach.ModifiedDate.slice(2)),
        category: categories.get(breach.Name),
    }));

    return {
        title: $('title').text(),
        description: $('head meta[name=description]').attr('content'),
        link: `${baseUrl}/en/breaches`,
        item: items,
        image: $('head meta[property=og:image]').attr('content'),
    };
}
