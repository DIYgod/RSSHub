import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import md5 from '@/utils/md5';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://xueqiu.com';
export const route: Route = {
    path: '/timeline/:usergroup_id?',
    categories: ['finance'],
    example: '/xueqiu/timeline/',
    parameters: { usergroup_id: '用户组 ID，-1 为全部关注用户' },
    features: {
        requireConfig: [
            {
                name: 'XUEQIU_COOKIES',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '用户关注时间线',
    maintainers: ['ErnestDong'],
    handler,
    description: `::: warning
用户关注动态需要登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
:::

| -1   | -2       | 1             |
| ---- | -------- | ------------- |
| 全部 | 关注精选 | 自定义第 1 组 |`,
};
async function handler(ctx) {
    const usergroupId = ctx.req.param('usergroup_id') ?? -1;
    if (config.xueqiu.cookies === undefined) {
        throw new ConfigNotFoundError('缺少雪球用户登录后的 Cookie 值');
    }
    const cookie: string = config.xueqiu.cookies;
    const sessionKey = md5(cookie);
    const data = await fetchTimeline(cookie, usergroupId);
    const items = await Promise.all(
        data.home_timeline.map((item) =>
            cache.tryGet(`xueqiu:timeline:${sessionKey}:${item.target}`, () => {
                const retweetedStatus = item.retweeted_status ? `<blockquote>${item.retweeted_status.user.screen_name}:&nbsp;${item.retweeted_status.description}</blockquote>` : '';
                const description = item.description + retweetedStatus;
                return Promise.resolve({
                    title: item.title === '' ? item.user.screen_name + (item.retweeted_status ? ' 转发' : '') : item.title,
                    description: item.text ? item.text + retweetedStatus : description,
                    pubDate: parseDate(item.created_at),
                    link: rootUrl + item.target,
                });
            })
        )
    );
    return {
        title: '雪球关注动态',
        link: 'https://xueqiu.com/',
        item: items,
    };
}
async function fetchTimeline(cookie: string, usergroupId = -1) {
    const groupId = String(usergroupId);
    const searchParams = new URLSearchParams({ source: 'user' });
    if (groupId !== '-1') {
        searchParams.set('usergroup_id', groupId);
    }
    const endpoint = groupId === '-2' ? 'system/home_timeline.json' : 'home_timeline.json';
    const url = `https://www.xueqiu.com/v4/statuses/${endpoint}?${searchParams}`;
    const response = await got({
        method: 'get',
        url,
        redirect: 'manual',
        headers: {
            Cookie: cookie,
        },
    });
    if (!Array.isArray(response.data?.home_timeline)) {
        throw new TypeError('The Xueqiu following API did not return a timeline. Refresh XUEQIU_COOKIES and verify access to the selected group.');
    }
    return response.data;
}
