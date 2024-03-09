import { Route } from '@/types';
import got from '@/utils/got';

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
    const link = `https://app.guancha.cn/user/get-published-list?page_size=20&page_no=1&uid=${uid}`;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: host,
        },
    });
    const list = response.data.data.items;
    const user_nick = list[0].user_nick;

    /** Get time from relative time in HTML */
    function getpass_at(e) {
        const minuteRelativeTime = /(\d+)\s*分钟前/;
        const hourRelativeTime = /(\d+)\s*小时前/;
        const yesterdayRelativeTime = /昨天\s*(\d+):(\d+)/;
        const shortDate = /(\d+)-(\d+)\s*(\d+):(\d+)/;

        // offset to ADD for transforming China time to UTC
        const chinaToUtcOffset = -8 * 3600 * 1000;
        // offset to ADD for transforming local time to UTC
        const localToUtcOffset = new Date().getTimezoneOffset() * 60 * 1000;
        // offset to ADD for transforming local time to china time
        const localToChinaOffset = localToUtcOffset - chinaToUtcOffset;

        let time;
        if (e === '刚刚') {
            time = new Date();
        } else if (minuteRelativeTime.test(e)) {
            const rel = minuteRelativeTime.exec(e);
            time = new Date(Date.now() - Number.parseInt(rel[1]) * 60 * 1000);
        } else if (hourRelativeTime.test(e)) {
            const rel = hourRelativeTime.exec(e);
            time = new Date(Date.now() - Number.parseInt(rel[1]) * 60 * 60 * 1000);
        } else if (yesterdayRelativeTime.test(e)) {
            const rel = yesterdayRelativeTime.exec(e);
            // this time is China time data in local timezone
            time = new Date(Date.now() - 86400 * 1000 + localToChinaOffset);
            time.setHours(Number.parseInt(rel[1]), Number.parseInt(rel[2]), 0, 0);
            // transform back to china timezone
            time = new Date(time.getTime() - localToChinaOffset);
        } else if (shortDate.test(e)) {
            const rel = shortDate.exec(e);
            const now = new Date(Date.now() + localToChinaOffset);
            const year = now.getFullYear();
            // this time is China time data in local timezone
            time = new Date(year, Number.parseInt(rel[1]) - 1, Number.parseInt(rel[2]), Number.parseInt(rel[3]), Number.parseInt(rel[4]));
            // transform back to china timezone
            time = new Date(time.getTime() - localToChinaOffset);
        } else {
            time = new Date(e);
        }
        return time;
    }
    return {
        title: `${user_nick}-观察者-风闻社区`,
        link,
        description: `${user_nick} 的个人主页`,
        item: list.map((item) => ({
            title: item.title,
            description: item.summary,
            pubDate: getpass_at(item.pass_at),
            link: `https://user.guancha.cn/main/content?id=${item.id}`,
            author: item.user_nick,
        })),
    };
}
