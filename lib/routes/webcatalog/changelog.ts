import { Route } from '@/types';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/changelog',
    categories: ['program-update'],
    example: '/webcatalog/changelog',
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
            source: ['desktop.webcatalog.io/:lang/changelog'],
        },
    ],
    name: 'Changelog',
    maintainers: ['Tsuyumi25'],
    handler,
    url: 'desktop.webcatalog.io/en/changelog',
};

async function handler() {
    const url = 'https://desktop.webcatalog.io/en/changelog';
    const response = await ofetch(url);
    const $ = load(response);

    // remove What's new
    $('.container article div.mb-20').remove();
    const items = $('.container article')
        .html()
        ?.split('<hr>')
        ?.map((section) => {
            const $section = load(section);
            const month = $section('h1').remove().text();
            const title = $section('h2').first().remove().text();
            return {
                title: `${month} - ${title}`,
                description: $section.html(),
                link: url,
                pubDate: parseDate(month),
                guid: `webcatalog-${month}-${title}`,
            };
        });

    return {
        title: 'WebCatalog Changelog',
        link: url,
        item: items,
        language: 'en',
    };
}
