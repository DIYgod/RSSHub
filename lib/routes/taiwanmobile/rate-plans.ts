import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/rate-plans',
    categories: ['other'],
    example: '/taiwanmobile/rate-plans',
    radar: [
        {
            source: ['taiwanmobile.com/cs/public/servAnn/queryList.htm', 'taiwanmobile.com/csonline/service/plan.html'],
        },
    ],
    name: '資費公告',
    maintainers: ['Tsuyumi25'],
    handler,
    url: 'www.taiwanmobile.com/csonline/service/plan.html',
};

async function handler(): Promise<Data> {
    const baseUrl = 'https://www.taiwanmobile.com';
    const listUrl = `${baseUrl}/csonline/service/plan.html`;
    const response = await ofetch<Array<{ plan: Array<{ title: string; date: string; link: string }> }>>(`${baseUrl}/cs/public/api/servAnn/query.htm`);
    const list = response[0].plan.slice(0, 20).map((item) => ({
        title: item.title,
        link: new URL(item.link, baseUrl).href,
        pubDate: parseDate(`${item.date.replaceAll('/', '-')}T00:00:00+08:00`),
    }));

    const descriptions = await pMap(
        list,
        (item) =>
            cache.tryGet(`${item.link}:body:v2`, async (): Promise<Pick<DataItem, 'description'>> => {
                const detailResponse = await ofetch(item.link);
                const content = load(detailResponse);

                return {
                    description: content('.announce-inner > div').html(),
                };
            }),
        { concurrency: 3 }
    );

    return {
        title: '台灣大哥大 - 資費公告',
        link: listUrl,
        item: list.map((item, index) => ({ ...item, ...descriptions[index] })),
    };
}
