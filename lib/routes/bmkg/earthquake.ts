import type { Data, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { fetchBmkgApi } from './utils';

interface EarthquakeResponse {
    alert: {
        info: Array<{
            eventid: number;
            date: string;
            time: string;
            latitude: string;
            longitude: string;
            magnitude: number;
            depth: string;
            area: string;
            description: string;
            instruction: string;
        }>;
    };
}

export const route: Route = {
    path: '/earthquake',
    categories: ['forecast'],
    example: '/bmkg/earthquake',
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
            source: ['bmkg.go.id/', 'bmkg.go.id/gempabumi/gempabumi-m5'],
        },
    ],
    name: 'Recent Earthquakes',
    maintainers: ['Shinanory'],
    handler,
    url: 'bmkg.go.id/gempabumi/gempabumi-m5',
};

async function handler(): Promise<Data> {
    const url = 'https://www.bmkg.go.id/gempabumi/gempabumi-m5';
    const response = await fetchBmkgApi<EarthquakeResponse>('/api/gempa/m5', url);
    const items = response.alert.info.map((item) => ({
        title: `${item.latitude}|${item.longitude}|${item.magnitude}|${item.depth}|${item.area}`,
        link: `https://www.bmkg.go.id/gempabumi/${item.eventid}`,
        description: `<p>${item.description}</p><p>${item.instruction}</p>`,
        pubDate: timezone(parseDate(`${item.date} ${item.time}`, 'DD-MM-YY HH:mm:ss [WIB]'), 7),
    }));

    return {
        title: 'Gempa Bumi M 5,0+ - BMKG',
        link: url,
        description: '印尼气象气候和地球物理局 最近的地震(M ≥ 5.0) | BMKG earthquake',
        item: items,
        language: 'id',
    };
}
