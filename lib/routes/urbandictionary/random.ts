import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/random',
    categories: ['other'],
    example: '/urbandictionary/random',
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
            source: ['urbandictionary.com/random.php', 'urbandictionary.com/'],
        },
    ],
    name: 'Random words',
    maintainers: ['TonyRL'],
    handler,
    url: 'urbandictionary.com/random.php',
};

async function handler() {
    const baseUrl = 'https://www.urbandictionary.com';
    const { data } = await got('https://api.urbandictionary.com/v0/random');

    const items = data.list.map((item) => ({
        title: item.word,
        description: art(path.join(__dirname, 'templates/definition.art'), { item }),
        link: `${baseUrl}/define.php?term=${item.word}`,
        guid: item.permalink,
        pubDate: parseDate(item.written_on),
        author: item.author,
    }));

    return {
        title: 'Urban Dictionary: Random words',
        link: `${baseUrl}/random.php`,
        item: items,
    };
}
