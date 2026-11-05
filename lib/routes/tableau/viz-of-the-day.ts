import { escapeAttribute } from 'entities';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface GalleryItem {
    title: string;
    authorProfileName: string;
    authorDisplayName: string;
    defaultViewRepoUrl: string;
    description: string;
    curatedImageUrl: string;
    curatedImageAltText: string;
    curatedAt: string;
}

export const route: Route = {
    path: '/viz-of-the-day',
    categories: ['study'],
    example: '/tableau/viz-of-the-day',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Viz of the day',
    maintainers: ['KaiyoungYu'],
    handler,
};

async function handler() {
    const baseUrl = 'https://public.tableau.com';
    const response = await ofetch<{ contents: GalleryItem[] }>(`${baseUrl}/public/apis/bff/discover/v2/vizzes/viz-of-the-day?startIndex=0&limit=12`);
    const items = response.contents.map((item) => ({
        title: item.title,
        link: `${baseUrl}/app/profile/${item.authorProfileName}/viz/${item.defaultViewRepoUrl.replace('/sheets/', '/')}`,
        pubDate: parseDate(item.curatedAt),
        author: item.authorDisplayName,
        description: `<div>${item.description}<img src="${escapeAttribute(item.curatedImageUrl)}" alt="${escapeAttribute(item.curatedImageAltText)}"></div>`,
        itunes_item_image: item.curatedImageUrl,
    }));

    return {
        title: 'Tableau Viz of the Day',
        link: `${baseUrl}/app/discover/viz-of-the-day`,
        image: 'https://help.tableau.com/current/pro/desktop/en-us/Resources/tableau-logo.png',
        item: items,
    };
}
