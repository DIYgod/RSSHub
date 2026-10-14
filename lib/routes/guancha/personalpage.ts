import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

type PublishedPost = { id: number; title: string; summary: string; pass_at: string; user_nick: string };

/** Get time from relative time in HTML */
function getPassAt(e) {
    const minuteRelativeTime = /(\d+)\s*分钟前/;
    const hourRelativeTime = /(\d+)\s*小时前/;
    const yesterdayRelativeTime = /昨天\s*(\d+):(\d+)/;
    const shortDate = /(\d+)-(\d+)\s+(\d+):(\d+)/;

    // offset to ADD for transforming China time to UTC
    const chinaToUtcOffset = -8 * 3600 * 1000;
    // offset to ADD for transforming local time to UTC
    const localToUtcOffset = new Date().getTimezoneOffset() * 60 * 1000;
    // offset to ADD for transforming local time to china time
    const localToChinaOffset = localToUtcOffset - chinaToUtcOffset;

    let time;
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(e)) {
        time = timezone(parseDate(e), 8);
    } else if (e === '刚刚') {
        time = new Date();
    } else if (minuteRelativeTime.test(e)) {
        const rel = minuteRelativeTime.exec(e);
        time = new Date(Date.now() - Number.parseInt(rel![1]) * 60 * 1000);
    } else if (hourRelativeTime.test(e)) {
        const rel = hourRelativeTime.exec(e);
        time = new Date(Date.now() - Number.parseInt(rel![1]) * 60 * 60 * 1000);
    } else if (yesterdayRelativeTime.test(e)) {
        const rel = yesterdayRelativeTime.exec(e);
        // this time is China time data in local timezone
        time = new Date(Date.now() - 86400 * 1000 + localToChinaOffset);
        time.setHours(Number.parseInt(rel![1]), Number.parseInt(rel![2]), 0, 0);
        // transform back to china timezone
        time = new Date(time.getTime() - localToChinaOffset);
    } else if (shortDate.test(e)) {
        const rel = shortDate.exec(e);
        const now = new Date(Date.now() + localToChinaOffset);
        const year = now.getFullYear();
        // this time is China time data in local timezone
        time = new Date(year, Number.parseInt(rel![1]) - 1, Number.parseInt(rel![2]), Number.parseInt(rel![3]), Number.parseInt(rel![4]));
        // transform back to china timezone
        time = new Date(time.getTime() - localToChinaOffset);
    } else {
        time = new Date(e);
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
                    return content('.article-txt-content').html() ?? undefined;
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
