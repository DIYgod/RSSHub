import { Route, ViewType } from '@/types';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const ROOT_URL = 'https://zhibo.sina.com.cn';

export const route: Route = {
    path: ['/finance/zhibo/:zhibo_id?', '/zhibo/:zhibo_id?'],
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/sina/zhibo',
    parameters: { zhibo_id: '直播频道 id，默认为 152（财经频道）' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '财经直播',
    maintainers: ['nczitzk'],
    handler,
    url: 'zhibo.sina.com.cn',
    description:
        '对接新浪财经直播接口（zhibo）。默认频道 152（财经）。支持使用 `?limit=` 控制条目数量（接口单页最多 10 条）。\n\n别名路径：`/sina/finance/zhibo/:zhibo_id?` 与 `/sina/zhibo/:zhibo_id?` 均可使用。',
};

interface ZhiboFeedItem {
    id: number;
    zhibo_id: number;
    rich_text: string;
    create_time: string; // 'YYYY-MM-DD HH:mm:ss'
    creator?: string;
}

async function handler(ctx) {
    const zhiboId = ctx.req.param('zhibo_id') ?? '152';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10;

    const apiUrl = `${ROOT_URL}/api/zhibo/feed`;

    const { data: res } = await got(apiUrl, {
        searchParams: {
            zhibo_id: zhiboId,
            pagesize: 10,
            tag: 0,
            dire: 'f',
            dpc: 1,
            page: 1,
        },
    });

    const list: ZhiboFeedItem[] = res?.result?.data?.feed?.list ?? [];

    const items = list.slice(0, limit).map((it) => {
        const plain = it.rich_text?.replace(/<[^>]+>/g, '').trim() ?? '';
        const title = plain.length > 0 ? (plain.length > 80 ? `${plain.slice(0, 80)}…` : plain) : `直播快讯 #${it.id}`;

        return {
            title,
            // 接口项没有稳定的详情页，这里指向 7x24 页面以便用户查看更多
            link: 'https://finance.sina.com.cn/7x24/',
            description: it.rich_text,
            author: it.creator,
            pubDate: parseDate(it.create_time),
            guid: `sina-finance-zhibo-${it.id}`,
        };
    });

    return {
        title: `新浪财经直播 - 频道 ${zhiboId}`,
        link: 'https://finance.sina.com.cn/7x24/',
        item: items,
    };
}


