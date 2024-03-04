import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import * as cheerio from 'cheerio';

export default async (ctx) => {
    const { province } = ctx.req.param();
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

    ctx.set('data', {
        title: '中央气象台全国气象预警',
        link: 'http://www.nmc.cn/publish/alarm.html',
        item: items,
    });
};
