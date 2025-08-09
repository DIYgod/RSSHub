import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseItems } from './utils';

export const route: Route = {
    path: '/',
    categories: ['multimedia'],
    example: '/sfmcompile',
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
            source: ['sfmcompile.club'],
            target: '/',
        },
    ],
    name: 'Main page',
    maintainers: ['vector0902'],

    handler: async () => {
        const url = `https://sfmcompile.club/`;
        // url = 'http://localhost:8000/sfm.html'; # local test
        const response = await ofetch(url);
        const $ = load(response);

        const items = $('.g1-collection-item')
            .toArray()
            .map((item) => parseItems($(item)));

        return {
            // channel title
            title: `SFMCompile.club`,
            // channel link
            link: `https://sfmcompile.club/`,
            // each feed item
            item: items,
        };
    },
};
