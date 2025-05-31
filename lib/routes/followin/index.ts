import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { apiUrl, favicon, getBParam, getBuildId, getGToken, parseList, parseItem } from './utils';

export const route: Route = {
    path: '/:categoryId?/:lang?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/followin',
    parameters: {
        categoryId: {
            description: 'Category ID',
            options: [
                { value: '1', label: 'For You' },
                { value: '9', label: 'Market' },
                { value: '13', label: 'Meme' },
                { value: '14', label: 'BRC20' },
                { value: '3', label: 'NFT' },
                { value: '5', label: 'Thread' },
                { value: '6', label: 'In-depth' },
                { value: '8', label: 'Tutorials' },
                { value: '11', label: 'Videos' },
            ],
            default: '1',
        },
        lang: {
            description: 'Language',
            options: [
                { value: 'en', label: 'English' },
                { value: 'zh-Hans', label: '简体中文' },
                { value: 'zh-Hant', label: '繁體中文' },
                { value: 'vi', label: 'Tiếng Việt' },
            ],
            default: 'en',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Home',
    maintainers: ['TonyRL'],
    handler,
    description: `Category ID

| For You | Market | Meme | BRC20 | NFT | Thread | In-depth | Tutorials | Videos |
| ------- | ------ | ---- | ----- | --- | ------ | -------- | --------- | ------ |
| 1       | 9      | 13   | 14    | 3   | 5      | 6        | 8         | 11     |

  Language

| English | 简体中文 | 繁體中文 | Tiếng Việt |
| ------- | -------- | -------- | ---------- |
| en      | zh-Hans  | zh-Hant  | vi         |`,
};

async function handler(ctx) {
    const { categoryId = '1', lang = 'en' } = ctx.req.param();
    const { limit = 20 } = ctx.req.query();
    const gToken = await getGToken(cache.tryGet);
    const bParam = getBParam(lang);

    const { data: response } = await got.post(`${apiUrl}/feed/list/recommended`, {
        headers: {
            'x-bparam': JSON.stringify(bParam),
            'x-gtoken': gToken,
        },
        json: {
            category_id: Number.parseInt(categoryId),
            count: Number.parseInt(limit),
        },
    });
    if (response.code !== 2000) {
        throw new Error(response.msg);
    }

    const buildId = await getBuildId(cache.tryGet);

    const list = parseList(response.data.list, lang, buildId);
    const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

    return {
        title: 'Followin',
        link: 'https://followin.io',
        image: favicon,
        item: items,
    };
}
