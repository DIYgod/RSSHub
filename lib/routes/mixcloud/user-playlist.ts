import { Route } from '@/types';
import { handler } from './index';

export const route: Route = {
    path: '/:username/playlists/:playlist',
    categories: ['multimedia'],
    example: '/mixcloud/dholbach/playlists/ecclectic-dance',
    parameters: {
        username: 'Username, can be found in URL',
        playlist: 'Playlist slug, can be found in URL',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['mixcloud.com/:username/playlists/:playlist'],
        },
        {
            source: ['www.mixcloud.com/:username/playlists/:playlist'],
        },
    ],
    name: 'Playlist',
    maintainers: ['Misaka13514'],
    handler,
};
