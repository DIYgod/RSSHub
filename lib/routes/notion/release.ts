import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const handler: Route['handler'] = async () => {
    const link = 'https://www.notion.com/releases';
    const data = await ofetch(link, {
        headers: {
            'Accept-Language': 'en-US',
        },
    });
    const $ = load(data);
    const item = $('article')
        .filter((_, element) => $(element).find('a[href^="/releases/"] h2').length > 0)
        .slice(0, 6)
        .toArray()
        .map((element) => {
            const release = $(element);
            return {
                title: release.find('h2').first().text(),
                pubDate: parseDate(release.find('time').first().text()),
                description: release.find('article').first().html(),
                link: new URL(release.find('a[href^="/releases/"]').first().attr('href')!, link).href,
            };
        });
    return {
        title: 'Notion Releases',
        link,
        item,
    };
};

export const route: Route = {
    name: 'Release',
    path: '/release',
    url: 'notion.so/releases',
    example: '/notion/release',
    categories: ['program-update'],
    maintainers: ['equt'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    handler,
};
