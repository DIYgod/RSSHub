import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { getArticle } from './utils';

export const route: Route = {
    path: '/',
    categories: ['traditional-media'],
    example: '/mirrormedia',
    parameters: {},
    name: '首页',
    maintainers: ['dzx-dzx'],
    radar: [
        {
            source: ['mirrormedia.mg'],
        },
    ],
    handler,
};

async function handler(ctx) {
    const rootUrl = 'https://www.mirrormedia.mg';

    const response = await ofetch('https://v3-statics.mirrormedia.mg/files/json/post_external01.json');

    const items: DataItem[] = [...response.choices.map((e) => ({ __from: 'choices', ...e })), ...response.latest.map((e) => ({ __from: 'latest', ...e }))]
        .map((e) => ({
            title: e.title,
            pubDate: parseDate(e.publishedDate),
            category: [...(e.sections ?? []).map((_) => _.name), e.__from],
            link: `${rootUrl}/${e.style === '' ? 'external' : 'story'}/${e.slug}`,
        }))
        .slice(0, getRouteLimit(ctx, 20));

    const list = await pMap(items, (item) => getArticle(item), { concurrency: 3 });

    return {
        title: '鏡週刊 Mirror Media',
        link: rootUrl,
        item: list,
    };
}
