import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/user_stock/:id',
    categories: ['finance'],
    example: '/xueqiu/user_stock/1247347556',
    parameters: { id: '用户 id, 可在用户主页 URL 中找到' },
    features: {
        requireConfig: [
            {
                name: 'XUEQIU_COOKIES',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['xueqiu.com/u/:id'],
        },
    ],
    name: '用户自选动态',
    maintainers: ['hillerliao'],
    handler,
    description: `::: warning
  用户自选动态需要登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
:::`,
};

async function handler(ctx) {
    const cookie = config.xueqiu.cookies;
    if (cookie === undefined) {
        throw new ConfigNotFoundError('缺少雪球用户登录后的 Cookie 值');
    }

    const id = ctx.req.param('id');

    const {
        data: { stocks: data },
    } = await ofetch(`https://stock.xueqiu.com/v5/stock/portfolio/stock/list.json?category=1&size=1000&uid=${id}`, {
        headers: {
            Cookie: cookie,
            Referer: `https://xueqiu.com/u/${id}`,
        },
    });

    const {
        user: { screen_name },
    } = await ofetch('https://xueqiu.com/statuses/original/show.json', {
        query: {
            user_id: id,
        },
        headers: {
            Cookie: cookie,
            Referer: `https://xueqiu.com/u/${id}`,
        },
    });

    return {
        title: `${screen_name} 的雪球自选动态`,
        link: `https://xueqiu.com/u/${id}`,
        description: `@${screen_name} 的雪球自选动态`,
        item: data.map((item) => ({
            title: `@${screen_name} 关注了股票 ${item.name}`,
            description: `@${screen_name} 在${parseDate(item.created).toLocaleString()} 关注了 ${item.marketplace} ${item.name}(${item.exchange}:${item.symbol})。`,
            pubDate: parseDate(item.created),
            link: `https://xueqiu.com/s/${item.symbol}`,
        })),
    };
}
