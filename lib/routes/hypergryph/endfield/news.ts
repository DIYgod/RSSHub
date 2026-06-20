import * as cheerio from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

type NewsItem = {
    cid: string;
    tab: string;
    sticky: boolean;
    title: string;
    author: string;
    displayTime: number;
    cover: string;
    extraCover: string;
    brief: string;
};

const parseList = (list: NewsItem[]) =>
    list.map((item) => ({
        title: item.title,
        author: item.author,
        description: item.brief.trim().replaceAll('\n', '<br>'),
        link: `https://endfield.hypergryph.com/news/${item.cid}`,
        pubDate: parseDate(item.displayTime, 'X'),
    }));

export const route: Route = {
    path: '/endfield/news/:group?',
    categories: ['game'],
    example: '/hypergryph/endfield/news',
    parameters: { group: '分组，默认为 `ALL`' },
    radar: [
        {
            source: ['endfield.hypergryph.com/news'],
        },
    ],
    name: '明日方舟：终末地 - 游戏公告与新闻',
    maintainers: ['E-larex'],
    handler,
    url: 'endfield.hypergryph.com/news',
    description: `| 全部 | 公告    | 活动   | 新闻 |
| ---- | ------- | ------ | ---- |
| ALL  | notices | events | news |`,
};

async function handler(ctx) {
    const { group = 'ALL' } = ctx.req.param();

    const normalizedGroup = group.toLowerCase();
    const validTabs = new Set(['notices', 'events', 'news']);
    if (normalizedGroup !== 'all' && !validTabs.has(normalizedGroup)) {
        throw new Error(`Invalid group: "${group}". Valid values: ALL, notices, events, news`);
    }

    const apiUrl = 'https://web-news.hypergryph.com/api/bulletin?lang=zh-cn&code=endfield_web&page=1&pageSize=10' + (normalizedGroup === 'all' ? '' : `&tabs[]=${normalizedGroup}`);

    const bulletinList: NewsItem[] = await cache.tryGet(
        `hypergryph:endfield:news:${normalizedGroup}`,
        async () => {
            const response = await ofetch(apiUrl);
            return response.data.list as NewsItem[];
        },
        config.cache.routeExpire,
        false
    );

    const list = parseList(bulletinList);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = cheerio.load(response);

                // The detail page's article HTML appears in one of two shapes
                // within the Next.js RSC stream (self.__next_f.push chunks):
                //   A) T-type value: a chunk boundary lands right before the HTML,
                //      so some chunk's payload starts with `<`.
                //   B) JSON-embedded: the HTML is the `data` field of a
                //      `"bulletin":{...}` object, and may be split across chunks.
                // One pass over the scripts handles both: we opportunistically
                // capture (A) and accumulate the full RSC payload for (B).
                let tTypeHtml: string | undefined;
                let rscPayload = '';
                for (const el of $('script').toArray()) {
                    const pushMatch = $(el)
                        .text()
                        .match(/self\.__next_f\.push\((.+)\)/s);
                    if (!pushMatch) {
                        continue;
                    }
                    let parsed;
                    try {
                        parsed = JSON.parse(pushMatch[1]);
                    } catch {
                        continue;
                    }
                    if (!Array.isArray(parsed) || parsed[0] !== 1 || typeof parsed[1] !== 'string') {
                        continue;
                    }
                    const chunk: string = parsed[1];
                    if (!tTypeHtml && chunk.trimStart().startsWith('<')) {
                        tTypeHtml = chunk;
                    }
                    rscPayload += chunk;
                }

                if (tTypeHtml) {
                    item.description = tTypeHtml;
                } else {
                    // Locate the bulletin object by content rather than RSC line ID
                    // (line IDs are assigned by the server and not stable).
                    const bulletinIdx = rscPayload.indexOf('"bulletin":{');
                    if (bulletinIdx !== -1) {
                        const lineStart = rscPayload.lastIndexOf('\n', bulletinIdx) + 1;
                        const nextNewline = rscPayload.indexOf('\n', bulletinIdx);
                        const line = rscPayload.slice(lineStart, nextNewline === -1 ? undefined : nextNewline);
                        const colonIdx = line.indexOf(':');
                        if (colonIdx !== -1) {
                            try {
                                const data = JSON.parse(line.slice(colonIdx + 1))?.[3]?.value?.bulletin?.data;
                                if (typeof data === 'string') {
                                    item.description = data;
                                }
                            } catch {
                                // leave description as the brief fallback
                            }
                        }
                    }
                }

                return item;
            })
        )
    );

    return {
        title: '《明日方舟：终末地》游戏公告与新闻',
        link: 'https://endfield.hypergryph.com/news',
        item: items,
        language: 'zh-cn',
    };
}
