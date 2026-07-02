import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

interface ArticleNav {
    id: number;
    pid: number;
    title: string;
    temp_id: number;
}

interface ArticleListItem {
    id: number;
    cid: string;
    title: string;
    image?: string;
    add_time: string;
    synopsis?: string;
    cate_name?: string;
    nav?: ArticleNav[];
    pdf?: Array<{ name?: string; url?: string }>;
}

interface ArticleDetail extends ArticleListItem {
    content?: string;
}

const CATEGORY_MAP: Record<string, string> = {
    '80': '宏观经济研究',
    '85': '区域信用研究',
    '90': '行业信用研究',
    '95': '债券市场研究',
    '177': '评级发展研究',
    '101': '评级市场表现研究',
    '168': '主权研究',
    '109': '专题研究',
};

const baseUrl = 'http://www.shxsj.com';

const handler = async (ctx: Context): Promise<Data> => {
    const { cid } = ctx.req.param();
    const limit = Number.parseInt(ctx.req.query('limit') ?? '15', 10);

    const listResponse = await ofetch<{
        code: number;
        data: { list: { data: ArticleListItem[] } };
    }>(`${baseUrl}/serve/api/article_api/get_cid_article`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { cid: Number(cid), page: 1 },
        responseType: 'json',
    });

    const list = (listResponse.data?.list?.data ?? []).slice(0, limit);

    const items: DataItem[] = (await Promise.all(
        list.map((article) =>
            cache.tryGet(`shxsj:article:${article.id}`, async (): Promise<DataItem> => {
                const detailResponse = await ofetch<{ code: number; data: ArticleDetail }>(`${baseUrl}/serve/api/article_api/visit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: { id: article.id },
                    responseType: 'json',
                });
                const detail = detailResponse.data ?? ({} as ArticleDetail);

                const link = `${baseUrl}/page?template=8&pageid=${article.id}&mid=2&listype=1`;
                const description = detail.content || article.synopsis || '';
                const dateStr = detail.add_time || article.add_time;

                const item: DataItem = {
                    title: detail.title || article.title,
                    description,
                    pubDate: dateStr ? timezone(parseDate(dateStr), +8) : undefined,
                    link,
                    guid: `shxsj:${article.id}`,
                    category: detail.nav?.filter((n) => n.pid !== 0).map((n) => n.title) ?? (article.cate_name ? [article.cate_name] : undefined),
                    language: 'zh-CN',
                };

                const pdfItem = (detail.pdf ?? article.pdf ?? [])[0];
                if (pdfItem?.url) {
                    const pdfUrl = new URL(pdfItem.url, baseUrl).href;
                    return {
                        ...item,
                        enclosure_url: pdfUrl,
                        enclosure_type: 'application/pdf',
                        enclosure_title: pdfItem.name || item.title,
                    };
                }

                return item;
            })
        )
    )) as DataItem[];

    const categoryName = CATEGORY_MAP[cid] ?? `分类 ${cid}`;

    return {
        title: `新世纪评级 - ${categoryName}`,
        link: `${baseUrl}/page?template=2&pageid=${cid}&mid=5`,
        description: `上海新世纪资信评估投资服务有限公司 - ${categoryName}`,
        item: items,
        language: 'zh-CN',
        allowEmpty: true,
    };
};

export const route: Route = {
    path: '/research/:cid',
    name: '信用研究',
    url: 'www.shxsj.com',
    maintainers: ['KwToPA'],
    handler,
    example: '/shxsj/research/80',
    parameters: {
        cid: '研究分类 ID，对应关系详见下表',
    },
    description: `分类 ID 与研究类型对应：

| cid | 研究类型         |
| --- | ---------------- |
| 80  | 宏观经济研究     |
| 85  | 区域信用研究     |
| 90  | 行业信用研究     |
| 95  | 债券市场研究     |
| 177 | 评级发展研究     |
| 101 | 评级市场表现研究 |
| 168 | 主权研究         |
| 109 | 专题研究         |

cid 即源站 URL 中的 \`pageid\`，例如 \`http://www.shxsj.com/page?template=2&pageid=80&mid=5\` 对应 cid = 80。`,
    categories: ['finance'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.shxsj.com/page'],
            target: (_, url) => {
                if (!url) {
                    return '';
                }
                const pageid = new URL(url).searchParams.get('pageid');
                return pageid && CATEGORY_MAP[pageid] ? `/shxsj/research/${pageid}` : '';
            },
        },
    ],
    view: ViewType.Articles,
};
