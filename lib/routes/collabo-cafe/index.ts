import { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseItems } from './parser';

export const handler = async (): Promise<Data | null> => {
    const baseUrl = 'https://collabo-cafe.com/';
    const res = await ofetch(baseUrl);
    const $ = load(res);
    const items = parseItems($);

    return {
        title: '全部文章',
        link: baseUrl,
        item: items,
    };
};

export const route: Route = {
    path: '/',
    categories: ['anime'],
    example: '/collabo-cafe/',
    parameters: undefined,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '全部文章',
    maintainers: ['cokemine'],
    handler,
};
