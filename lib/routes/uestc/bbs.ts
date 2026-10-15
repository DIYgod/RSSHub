import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface TopListItem {
    thread_id: number;
    subject: string;
    author: string;
    dateline: string | number;
    description?: string | null;
}
export const route: Route = {
    path: '/bbs/:types?',
    name: '清水河畔',
    maintainers: ['huyyi'],
    categories: ['university'],
    url: 'bbs.uestc.edu.cn',
    example: '/uestc/bbs/newthread',
    parameters: { types: '选择内容类型(多选`,`分割），可选值：[newreply,newthread,digest,life,hotlist]。默认为所有。' },
    features: {
        requireConfig: [
            {
                name: 'UESTC_BBS_COOKIE',
                optional: false,
                description: '河畔的cookie',
            },
            {
                name: 'UESTC_BBS_AUTH_STR',
                optional: false,
                description: '河畔Header中的authorization字段',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    description: `::: tip
仅支持自建，您需要设置以下配置才能正常使用：

- 河畔 cookie: \`UESTC_BBS_COOKIE\`
- Header 中的授权字段: \`UESTC_BBS_AUTH_STR\`

:::`,
    radar: [
        {
            source: ['bbs.uestc.edu.cn/*'],
            target: '/bbs/newthread',
        },
    ],
    handler: async (ctx) => {
        const { bbsCookie, bbsAuthStr } = config.uestc;
        if (!bbsCookie || !bbsAuthStr) {
            throw new ConfigNotFoundError('未配置 Cookie 或 Authorization。请检查配置。');
        }
        const { types = 'newreply,newthread,digest,life,hotlist' } = ctx.req.param();
        const data = await ofetch(`https://bbs.uestc.edu.cn/_/index?top_list=${types}`, {
            headers: {
                Cookie: bbsCookie,
                Referer: 'https://bbs.uestc.edu.cn/new',
                authorization: bbsAuthStr,
            },
        });
        if (!data || typeof data !== 'object' || !('code' in data)) {
            throw new Error('The forum API did not return its expected JSON response. Check whether the official API endpoint has changed.');
        }
        if (data.code !== 0) {
            throw new Error(`The forum API returned error code ${data.code}. Check the source service response.`);
        }
        if (!data.data) {
            throw new ConfigNotFoundError('The forum API did not return the requested lists. Update UESTC_BBS_COOKIE and UESTC_BBS_AUTH_STR from a session with access to the forum.');
        }
        if (!data.data.top_list || typeof data.data.top_list !== 'object' || Array.isArray(data.data.top_list) || Object.values(data.data.top_list).some((items) => !Array.isArray(items))) {
            throw new Error('The forum API did not provide its expected top_list structure. Check the current source API contract.');
        }
        const itemsRaw = Object.entries<TopListItem[]>(data.data.top_list).flatMap(([label, items]) => items.map((item) => ({ ...item, label })));
        const items = await pMap(
            itemsRaw,
            async (item) => {
                const detailUrl = `https://bbs.uestc.edu.cn/forum.php?mod=viewthread&tid=${item.thread_id}`;
                const { description } = await cache.tryGet(`uestc:bbs:detail:v1:${detailUrl}`, async () => {
                    const response = await ofetch(detailUrl, {
                        headers: {
                            Cookie: bbsCookie,
                            Referer: 'https://bbs.uestc.edu.cn',
                            authorization: bbsAuthStr,
                        },
                    });
                    const $ = load(response);
                    return { description: $('div#postlist').html() };
                });
                const pubDate = isOneOf(item.dateline, [undefined, null]) || item.dateline === '' ? undefined : parseDate(item.dateline, 'X');
                return {
                    title: item.subject,
                    link: `https://bbs.uestc.edu.cn/thread/${item.thread_id}`,
                    author: item.author,
                    category: item.label,
                    pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined,
                    description,
                };
            },
            { concurrency: 3 }
        );
        return {
            title: '清水河畔',
            link: 'https://bbs.uestc.edu.cn/new',
            item: items,
        };
    },
};

function isOneOf<const T>(value: unknown, values: readonly T[]): value is T {
    const candidates: readonly unknown[] = values;
    return candidates.includes(value);
}
