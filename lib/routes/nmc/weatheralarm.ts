import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/weatheralarm/:province?',
    categories: ['forecast'],
    example: '/nmc/weatheralarm/广东省',
    parameters: { province: '省份' },
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
            source: ['nmc.cn/publish/alarm.html', 'nmc.cn/'],
            target: '/weatheralarm',
        },
    ],
    name: '全国气象预警',
    maintainers: ['ylc395'],
    handler,
    url: 'nmc.cn/publish/alarm.html',
};

async function handler(ctx) {
    const { province = '' } = ctx.req.param();
    const alarmInfoURL = 'http://www.nmc.cn/rest/findAlarm';
    const { data: response } = await got(alarmInfoURL, {
        searchParams: {
            pageNo: 1,
            pageSize: 20,
            signaltype: '',
            signallevel: '',
            province,
        },
    });
    const list: Array<DataItem & { link: string }> = response.data.page.list.map((item) => ({
        title: item.title,
        link: `http://www.nmc.cn${item.url}`,
        pubDate: timezone(parseDate(item.issuetime), 8),
    }));

    const items = await pMap(
        list,
        async (item) => ({
            ...item,
            description: await cache.tryGet(`nmc:alarm:${item.link}`, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                return (
                    $('#icon').html() +
                    $('#alarmtext')
                        .toArray()
                        .map((i) => $(i).html())
                        .join('')
                );
            }),
        }),
        { concurrency: 3 }
    );

    return {
        title: '中央气象台全国气象预警',
        link: 'http://www.nmc.cn/publish/alarm.html',
        allowEmpty: true,
        item: items,
    };
}
