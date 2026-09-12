import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseScriptData } from '@/utils/parse-script-data';

export const route: Route = {
    path: '/hottest',
    categories: ['shopping'],
    example: '/hotukdeals/hottest',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.hotukdeals.com/'],
        },
    ],
    name: 'hottest',
    maintainers: ['DIYgod'],
    handler,
    url: 'www.hotukdeals.com/',
};

async function handler() {
    const data = await got.get('https://www.hotukdeals.com/');

    const $ = load(data.data);
    const script = $('script')
        .toArray()
        .map((element) => $(element).text())
        .filter((source) => source.includes('__INITIAL_STATE__'))
        .join('\n');
    const { widgets } = parseScriptData<{
        widgets: {
            hottestWidget: {
                threads: Array<{ title: string; mainImage: { path: string; name: string }; temperature: number; displayPrice: string; url: string }>;
            };
        };
    }>(script, '__INITIAL_STATE__');
    const threads = widgets.hottestWidget.threads;

    return {
        title: 'hotukdeals hottest',
        link: 'https://www.hotukdeals.com/',
        item: threads.map((item) => ({
            title: item.title,
            description: `<img src="https://images.hotukdeals.com/${item.mainImage.path}/${item.mainImage.name}/re/768x768/qt/60/${item.mainImage.name}.jpg"><br>${item.temperature}° ${item.title}<br>${item.displayPrice}`,
            link: item.url,
        })),
    };
}
