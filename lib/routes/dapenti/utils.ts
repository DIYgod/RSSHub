import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const channels = {
    agile: '乐活',
    aieverything: 'AI Everything',
    caijing: '财经风云',
    changyuedu: '长阅读',
    dianying: '乐影',
    fushihui: '浮世汇',
    piaoquan: '铂程的票圈',
    shijieguan: '世界观',
    tugua: '喷嚏图卦',
    xilei: '铂程斋',
    youxuan: '喷嚏优选',
};

const legacyIds = {
    70: 'tugua',
    105: 'shijieguan',
    182: 'changyuedu',
    184: 'fushihui',
    188: 'youxuan',
    189: 'aieverything',
};

export default {
    parseFeed: async ({ subjectid: subjectId }) => {
        const channel = legacyIds[subjectId] ?? subjectId;
        const response = await ofetch('https://www.dapenti.com/blog/member-search/api.asp', {
            query: {
                channel,
                sort: 'newest',
                cursor: 0,
                limit: 30,
            },
        });
        const list: DataItem[] = response.hits.map((hit) => {
            const link = new URL(hit.source_url, 'https://www.dapenti.com');
            return {
                title: hit.topic,
                link: link.href,
                author: link.searchParams.get('name')!,
                pubDate: parseDate(hit.addtime, 8),
                description: hit.snippet.replaceAll('\n', '<br>'),
            };
        });

        const items = await Promise.all(
            // Fetch the latest three entries with their full public content.
            list.slice(0, 3).map((item) =>
                cache.tryGet(item.link!, async () => {
                    const articleResponse = await ofetch(item.link!, {
                        responseType: 'arrayBuffer',
                    });
                    const articleHtml = new TextDecoder('gbk').decode(articleResponse);
                    const $article = load(articleHtml);
                    const description = $article('.article-content');
                    if (channel === 'tugua') {
                        description.children(':contains("每天一图卦，让我们更清楚地了解这个世界")').prevAll().remove();
                    }
                    if (description.find('h2:contains("会员专属内容")').length === 0) {
                        item.description = description.html()!;
                    }

                    return item;
                })
            )
        );

        return {
            title: `${channels[channel]} - 喷嚏网`,
            link: `https://www.dapenti.com/blog/member-channel.asp?channel=${channel}`,
            item: items,
        };
    },
};
