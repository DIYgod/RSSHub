import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const pageUrl = 'https://www.asus.com/campaign/GPU-Tweak-III/tw/index.php';

export const route: Route = {
    path: '/gpu-tweak',
    categories: ['program-update'],
    example: '/asus/gpu-tweak',
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
            source: ['asus.com/campaign/GPU-Tweak-III/*', 'asus.com/'],
        },
    ],
    name: 'GPU Tweak',
    maintainers: ['TonyRL'],
    handler,
    url: 'asus.com/campaign/GPU-Tweak-III/*',
};

async function handler() {
    const response = await got(pageUrl);
    const $ = load(response.data);

    const items = $('section div.inner div.item')
        .toArray()
        .map((item) => {
            item = $(item);
            item.find('.last').remove();
            return {
                title: item.find('.ver h6').text().trim(),
                description: item.find('.btnbox a.open_patch_lightbox').attr('data-info'),
                pubDate: parseDate(item.find('.ti').text()),
                link: item.find('.btnbox a[download=]').attr('href'),
            };
        });

    return {
        title: $('head title').text(),
        description: $('meta[name=description]').attr('content'),
        image: new URL($('head link[rel="shortcut icon"]').attr('href'), pageUrl).href,
        link: pageUrl,
        item: items,
        language: $('html').attr('lang'),
    };
}
