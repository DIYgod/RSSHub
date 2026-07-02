import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, fetchJson, getNextBuildId } from './utils';

export const route: Route = {
    path: '/contests',
    categories: ['design'],
    example: '/makerworld/contests',
    name: 'Contests',
    maintainers: ['TonyRL'],
    handler,
    radar: [
        {
            source: ['makerworld.com/:lang/contests'],
        },
    ],
};

async function handler() {
    const nextBuildId = await getNextBuildId();
    const response = await fetchJson(`${baseUrl}/_next/data/${nextBuildId}/en/contests.json`);
    const { listConst, previewList } = response.pageProps;

    const items = [
        ...listConst.map((c) => ({
            title: c.contestName,
            link: `${baseUrl}/en/contests/${c.id}?name=${c.contestName}`,
            description: c.themeDesc,
            pubDate: parseDate(c.startTime),
        })),
        ...previewList.map((p) => ({
            title: p.contestTheme,
            description: p.themeDesc,
            pubDate: parseDate(p.contestTime),
        })),
    ];

    return {
        title: 'Contest - MakerWorld',
        description: 'Join the contest to showcase your creativity and win substantial rewards',
        link: `${baseUrl}/en/contests`,
        image: `${baseUrl}/favicon_new.png`,
        item: items,
    };
}
