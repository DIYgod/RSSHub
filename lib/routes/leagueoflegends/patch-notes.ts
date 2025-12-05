import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/patch-notes',
    categories: ['game'],
    example: '/leagueoflegends/patch-notes',
    radar: [
        {
            source: ['www.leagueoflegends.com/en-us/news/tags/patch-notes/', 'www.leagueoflegends.com/en-us/news/game-updates/:postSlug'],
        },
    ],
    name: 'Patch Notes',
    maintainers: ['noahm'],
    async handler() {
        const url = 'https://www.leagueoflegends.com/en-us/news/tags/patch-notes/';
        const response = await got({
            method: 'get',
            url,
        });

        const data = response.data;

        const $ = load(data);
        const nextData = $('script[id="__NEXT_DATA__"]').text();
        if (!nextData) {
            throw new Error('missing next data');
        }
        const list: PatchNotesItem[] = JSON.parse(nextData).props.pageProps.page.blades[2].items;

        return {
            title: 'League of Legends Patch Notes',
            link: url,
            item: list.map(
                (item): DataItem => ({
                    title: item.title,
                    description: item.description.body,
                    pubDate: parseDate(item.publishedAt),
                    link: item.action.payload.url,
                    guid: item.analytics.contentId,
                    image: item.media.url,
                    itunes_item_image: item.media.url,
                })
            ),
        };
    },
};

// partial type definition of JSON data pre-filled on the page
interface PatchNotesItem {
    title: string;
    publishedAt: string;
    description: {
        type: 'html';
        body: string;
    };
    media: {
        dimensions: {
            height: number;
            width: number;
        };
        mimeType: string;
        url: string;
    };
    action: {
        payload: {
            url: string;
        };
        type: 'weblink';
    };
    analytics: {
        contentId: string;
    };
}
