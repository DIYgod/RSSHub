import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
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
    const cookie = config.xueqiu.cookies;
    const limit = ctx.req.query('limit') || 15;
    const usergroup_id = ctx.req.param('usergroup_id') ?? -1;
    if (cookie === undefined) {
        throw new ConfigNotFoundError('缺少雪球用户登录后的 Cookie 值');
    }
    let out: DataItem[] = [];
    let max_id = -1;

    async function fetchItems() {
        const data = await fetchNextID(max_id, cookie as string, usergroup_id);
        const items = await Promise.all(
            data.home_timeline.map((item) =>
                cache.tryGet(item.target, async () => {
                    const retweetedStatus = item.retweeted_status ? `<blockquote>${item.retweeted_status.user.screen_name}:&nbsp;${item.retweeted_status.description}</blockquote>` : '';
                    const description = item.description + retweetedStatus;
                    const result = await Promise.resolve({
                        title: item.title === '' ? item.user.screen_name + (item.retweeted_status ? ' 转发' : '') : item.title,
                        description: item.text ? item.text + retweetedStatus : description,
                        pubDate: parseDate(item.created_at),
                        link: rootUrl + item.target,
                    });
                    return result;
                })
            )
        );
        out = [...out, ...items];
        max_id = data.next_max_id;

        if (out.length < limit) {
            await fetchItems();
        }
    }

    await fetchItems();

    return {
        title: '雪球关注动态',
        link: 'https://xueqiu.com/',
        item: out,
    };
}
async function fetchNextID(max_id: number, cookie: string, usergroup_id = -1) {
    let url = `https://xueqiu.com/v4/statuses/system/home_timeline.json?source=user&usergroup_id=${usergroup_id}`;
    if (max_id > 0) {
        url += `&max_id=${max_id}`;
    }
    const response = await got({
        method: 'get',
        url,
        headers: {
            Cookie: cookie,
        },
    });
    return response.data;
}
