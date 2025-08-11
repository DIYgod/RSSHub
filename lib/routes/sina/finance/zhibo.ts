import { Route, ViewType } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const ROOT_URL = 'https://zhibo.sina.com.cn';

export const route: Route = {
    path: ['/finance/zhibo/:zhibo_id?', '/zhibo/:zhibo_id?'],
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/sina/zhibo',
    parameters: {
        zhibo_id: '直播频道 id，默认为 152（财经）。常见：151 政经、153 综合、155 市场、164 国际、242 行业',
        limit: '返回条数，默认 20；接口单页最多 10 条，超过将自动分页抓取',
        pagesize: '单页条数（1-10），默认 10；超过仍按 10 处理',
        tag: '标签过滤，0 表示不过滤（默认）。常见：3 公司、5 市场、7 央行、8 宏观、11 美股、12 A股（以实时返回为准）',
        dire: "方向，'f'（默认）或 'b'",
        dpc: '客户端标记，默认 1（与官网一致）',
    },
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
        '对接新浪财经直播接口（zhibo）。\n\n' +
        '参数：\n' +
        '- `zhibo_id`: 频道 ID，默认 152（财经）。常见：151 政经、153 综合、155 市场、164 国际、242 行业\n' +
        '- `limit`: 返回条数，默认 20。接口单页最多 10 条，超过会自动分页抓取\n' +
        '- `pagesize`: 单页条数（1-10），默认 10\n' +
        '- `tag`: 标签过滤，0 表示不过滤（默认）。示例：3 公司、5 市场、7 央行、8 宏观、11 美股、12 A股（以实时返回为准）\n' +
        "- `dire`: 方向，'f'（默认）或 'b'\n" +
        '- `dpc`: 客户端标记，默认 1\n\n' +
        '别名路径：`/sina/finance/zhibo/:zhibo_id?` 与 `/sina/zhibo/:zhibo_id?` 均可使用。',
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
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;
    const pagesizeQuery = ctx.req.query('pagesize');
    const tag = ctx.req.query('tag') ?? '0';
    const dire = ctx.req.query('dire') ?? 'f';
    const dpc = ctx.req.query('dpc') ?? '1';

    const apiUrl = `${ROOT_URL}/api/zhibo/feed`;

    const pageSize = Math.min(10, Math.max(1, pagesizeQuery ? Number.parseInt(pagesizeQuery) : 10)); // 接口单页上限
    const maxPages = Math.max(1, Math.ceil(limit / pageSize));

    const collected: ZhiboFeedItem[] = [];
    const pageNumbers = Array.from({ length: maxPages }, (_, i) => i + 1);
    const pages = await Promise.all(
        pageNumbers.map((page) =>
            got(apiUrl, {
                searchParams: {
                    zhibo_id: zhiboId,
                    pagesize: pageSize,
                    tag,
                    dire,
                    dpc,
                    page,
                },
            }).then((res) => ({ page, list: (res.data?.result?.data?.feed?.list as ZhiboFeedItem[]) ?? [] }))
        )
    );
    pages.sort((a, b) => a.page - b.page);
    for (const p of pages) {
        if (collected.length >= limit) {
            break;
        }
        if (p.list.length) {
            const remain = limit - collected.length;
            collected.push(...p.list.slice(0, remain));
        }
    }

    let items = collected.slice(0, limit).map((it) => {
        const plain = it.rich_text?.replace(/<[^>]+>/g, '').trim() ?? '';
        const title = plain.length > 0 ? (plain.length > 80 ? `${plain.slice(0, 80)}…` : plain) : `直播快讯 #${it.id}`;

        // 7x24 单条详情页：观察到格式为 /7x24/sina-finance-zhibo-<id>
        const link = `https://finance.sina.com.cn/7x24/sina-finance-zhibo-${it.id}`;

        return {
            title,
            link,
            description: it.rich_text,
            author: it.creator,
            pubDate: parseDate(it.create_time),
            guid: `sina-finance-zhibo-${it.id}`,
        };
    });

    // 对含“一图看懂”的项，尝试抓取 og:image 并补充图片
    items = await Promise.all(
        items.map(async (item) => {
            try {
                if (!item.description || /<img\s/i.test(item.description)) {
                    return item;
                }
                const text = `${item.title ?? ''}${item.description ?? ''}`;
                if (!/一图看懂/.test(text)) {
                    return item;
                }
                if (!item.link) {
                    return item;
                }

                const resp = await got(item.link);
                const $ = load(resp.data);
                const ogImage = $('meta[property="og:image"]').attr('content');
                const twitterImage = $('meta[name="twitter:image"], meta[name="twitter:image:src"]').attr('content');
                const img = ogImage || twitterImage;
                if (img) {
                    item.description = `${item.description}<br/><img src="${img}" referrerpolicy="no-referrer" />`;
                }
            } catch {
                // ignore network/parse errors per item
            }
            return item;
        })
    );

    const CHANNELS: Record<string, string> = {
        '151': '政经',
        '152': '财经',
        '153': '综合',
        '155': '市场',
        '164': '国际',
        '242': '行业',
    };

    return {
        title: `新浪财经直播 - ${CHANNELS[zhiboId] ?? zhiboId}`,
        link: 'https://finance.sina.com.cn/7x24/',
        item: items,
    };
}
