import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const base = 'https://www.jpmorganchase.com';
const frontPageUrl = `${base}/institute/all-topics`;
const indexUrl = `${base}/services/json/v1/dynamic-grid.service/parent=jpmorganchase/global/US/en/home/institute/all-topics&comp=root/content-parsys/dynamic_grid&page=p1.json`;

export const route: Route = {
    path: '/',
    example: '/jpmorganchase',
    categories: ['finance'],
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
            source: ['jpmorganchase.com/institute/all-topics'],
            target: '/',
        },
    ],
    name: 'Research Topics',
    maintainers: ['dousha'],
    handler,
    url: 'www.jpmorganchase.com/institute/all-topics',
};

type PartitionMeta = {
    'total-items': number;
    page: number;
    'page-size': number;
    'max-pages': number;
    'partition-size': string;
};

type IndexEntry = {
    title: string;
    date: string;
    hideDate: boolean;
    description: string;
    type: string;
    link: string;
    linkText: string;
    image: string;
};

async function fetchIndexEntires(): Promise<IndexEntry[]> {
    const response = await ofetch(indexUrl);
    if (!('meta' in response)) {
        return [];
    }

    const meta = response.meta as PartitionMeta;
    const maxItemCount = Number(meta['partition-size']);

    return (response.items as IndexEntry[]).slice(0, maxItemCount);
}

function fetchDataItem(entry: IndexEntry): Promise<DataItem> {
    const url = `${base}${entry.link}`;

    return cache.tryGet(url, async () => {
        let authors: string[] = [];
        let description: string = '';
        let category: string[] = [];
        let articleDate: string = entry.date;
        const pageContent: string = await ofetch(url);

        if (pageContent.length > 0) {
            const $ = load(pageContent);

            category = [$('.eyebrow').text()];
            authors = $('.author-name')
                .toArray()
                .map((el) => $(el).text().trim());
            articleDate = $('.date').text().trim() || entry.date;
            description = $('.root').children('div').children('div:eq(1)').html() || '';
        }

        return {
            category,
            author: authors.join(', '),
            title: entry.title,
            description,
            link: url,
            pubDate: parseDate(articleDate),
        } satisfies DataItem;
    }) as Promise<DataItem>;
}

async function handler(): Promise<Data> {
    const entires = await fetchIndexEntires();
    const items = await Promise.all(entires.map((it) => fetchDataItem(it)));

    return {
        title: 'All Topics - JPMorganChase Institute',
        link: frontPageUrl,
        item: items,
    };
}
