import type { Data, Route } from '@/types';
import { fetchItems, hyphen2Pascal } from './utils';

export const route: Route = {
    path: '/series/:seriesName',
    categories: ['programming'],
    example: '/web/series/new-to-the-web',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['web.dev/series/:seriesName'],
        target: '/web/articles/:seriesName',
    },
    name: 'Series',
    maintainers: ['KarasuShin'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const seriesName = ctx.req.param('seriesName');

    return {
        title: seriesName,
        link: `https://web.dev/series/${seriesName}`,
        image: 'https://web.dev/_pwa/web/icons/icon-144x144.png',
        item: await fetchItems(`category:${hyphen2Pascal(seriesName)}`),
    };
}
