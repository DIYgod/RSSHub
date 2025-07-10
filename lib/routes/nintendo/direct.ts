import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/direct',
    categories: ['game'],
    example: '/nintendo/direct',
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
            source: ['nintendo.com/nintendo-direct/archive', 'nintendo.com/'],
        },
    ],
    name: 'Nintendo Direct',
    maintainers: ['HFO4'],
    handler,
    url: 'nintendo.com/nintendo-direct/archive',
};

async function handler() {
    const response = await got('https://www.nintendo.com/nintendo-direct/archive/');
    const data = response.data;

    const $ = load(data);
    const nextData = JSON.parse($('script#__NEXT_DATA__').text());

    delete nextData.props.pageProps.initialApolloState.ROOT_QUERY;
    const result = Object.values(nextData.props.pageProps.initialApolloState).map((item) => ({
        title: item.name,
        pubDate: parseDate(item.startDate),
        link: `https://www.nintendo.com/nintendo-direct/${item.slug}/`,
        description: art(path.join(__dirname, 'templates/direct.art'), {
            publicId: item.thumbnail.publicId,
            content: item.description.json.content,
        }),
    }));

    return {
        title: 'Nintendo Direct（任天堂直面会）',
        link: 'https://www.nintendo.com/nintendo-direct/archive/',
        description: '最新的任天堂直面会日程信息',
        item: result,
    };
}
