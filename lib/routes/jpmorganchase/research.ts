import { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const base = 'https://www.jpmorganchase.com';
const indexPageUrl = `${base}/services/json/v1/dynamic-grid.service/parent=jpmorganchase/global/US/en/home/institute/all-topics&comp=root/content-parsys/dynamic_grid&page=p1.json`;

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
            source: ['jpmorganchase.com/institute/'],
            target: '/',
        },
    ],
    name: 'Research Topics',
    maintainers: ['dousha'],
    handler,
    url: 'www.jpmorganchase.com/institute/all-topics',
};

function fetchEntryCached(url: string) {
    return cache.tryGet(url, async () => {
        const response = await ofetch(url);
        const $ = load(response);

        const authors = $('.author-name')
            .toArray()
            .map((el) => $(el).text().trim());

        return {
            category: [$('.eyebrow').text()],
            author: authors.join(', '),
            title: $('h1').text(),
            description: $('#main').html() || '',
            link: url,
            pubDate: parseDate($('.documentdate').text()),
        } satisfies DataItem;
    });
}

function parseDetails(link: string) {
    const fullLink = `${base}${link}`;

    return fetchEntryCached(fullLink);
}

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

async function handler(): Promise<Data> {
    const items = (await cache.tryGet(indexPageUrl, async () => {
        const response = await ofetch(indexPageUrl);
        const meta = response.meta as PartitionMeta;
        const maxItemCount = Number(meta['partition-size']);
        const items = (response.items as IndexEntry[]).slice(0, maxItemCount);

        return await Promise.all(items.map((it) => parseDetails(it.link)));
    })) as DataItem[];

    return {
        title: 'All Topics - JPMorgan Chase Institute',
        link: indexPageUrl,
        item: items,
    };
}
