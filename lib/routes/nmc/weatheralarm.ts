import * as cheerio from 'cheerio';

import type { Route } from '@/types';
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
    const alarmInfoURL = `http://www.nmc.cn/rest/findAlarm`;
    const { data: response } = await got(alarmInfoURL, {
        searchParams: {
            pageNo: 1,
            pageSize: 20,
            signaltype: '',
            signallevel: '',
            province,
        },
    });
    const list = response.data.page.list.map((item) => ({
        title: item.title,
        link: `http://www.nmc.cn${item.url}`,
        pubDate: timezone(parseDate(item.issuetime), 8),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                item.description =
                    $('#icon').html() +
                    $('#alarmtext')
                        .toArray()
                        .map((i) => $(i).html())
                        .join('');

                return item;
            })
        )
    );

    return {
        title: '中央气象台全国气象预警',
        link: 'http://www.nmc.cn/publish/alarm.html',
        allowEmpty: true,
        item: items,
    };
}
