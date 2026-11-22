import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

type PublishedPost = { id: number; title: string; summary: string; pass_at: string; user_nick: string };

/** Get time from relative time in HTML */
function getPassAt(e) {
    const minuteRelativeTime = /(\d+)\s*分钟前/;
    const hourRelativeTime = /(\d+)\s*小时前/;
    const yesterdayRelativeTime = /昨天\s*(\d+):(\d+)/;
    const shortDate = /(\d+)-(\d+)\s+(\d+):(\d+)/;

    const now = Temporal.Now.zonedDateTimeISO('+08:00');

    let time;
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(e)) {
        time = parseDate(e, 8);
    } else if (e === '刚刚') {
        time = now.toInstant();
    } else if (minuteRelativeTime.test(e)) {
        const rel = minuteRelativeTime.exec(e);
        time = now.toInstant().subtract({ minutes: Number.parseInt(rel![1]) });
    } else if (hourRelativeTime.test(e)) {
        const rel = hourRelativeTime.exec(e);
        time = now.toInstant().subtract({ hours: Number.parseInt(rel![1]) });
    } else if (yesterdayRelativeTime.test(e)) {
        const rel = yesterdayRelativeTime.exec(e);
        time = now
            .subtract({ days: 1 })
            .withPlainTime({ hour: Number.parseInt(rel![1]), minute: Number.parseInt(rel![2]) })
            .toInstant();
    } else if (shortDate.test(e)) {
        const rel = shortDate.exec(e);
        time = Temporal.ZonedDateTime.from({
            timeZone: '+08:00',
            year: now.year,
            month: Number.parseInt(rel![1]),
            day: Number.parseInt(rel![2]),
            hour: Number.parseInt(rel![3]),
            minute: Number.parseInt(rel![4]),
        }).toInstant();
    } else {
        time = parseDate(e);
    }
    return time;
}

export const route: Route = {
    path: '/personalpage/:uid',
    categories: ['new-media'],
    example: '/guancha/personalpage/243983',
    parameters: { uid: '用户id， 可在URL中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '个人主页文章',
    maintainers: ['Jeason0228'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const host = 'https://user.guancha.cn';
    const url = new URL('https://app.guancha.cn/user/get-published-list');
    url.searchParams.set('page_size', '20');
    url.searchParams.set('page_no', '1');
    url.searchParams.set('uid', uid);
    const response = await got({
        method: 'get',
        url: url.href,
        headers: {
            Referer: host,
        },
    });
    const list: PublishedPost[] = response.data.data.items;
    const userNick = list[0].user_nick;

    return {
        title: `${userNick}-观察者-风闻社区`,
        link: `${host}/user/personal-homepage?uid=${encodeURIComponent(uid)}`,
        description: `${userNick} 的个人主页`,
        item: await pMap(
            list,
            async (item) => {
                const link = `https://user.guancha.cn/main/content?id=${item.id}`;
                const description = await cache.tryGet(`guancha:personal:article:${link}`, async () => {
                    const detail = await got(link);
                    const content = load(detail.data);
                    return content('.article-txt-content').html();
                });
                return {
                    title: item.title,
                    summary: item.summary,
                    description,
                    pubDate: getPassAt(item.pass_at),
                    link,
                    author: item.user_nick,
                };
            },
            { concurrency: 3 }
        ),
    };
}
