import { load } from 'cheerio';
import { escapeText } from 'entities';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { evaluateScriptData } from '@/utils/evaluate-script';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://h5-ol.sns.sohu.com/hy-moyukik-h5';

export const route: Route = {
    path: '/event/:id',
    example: '/moyukik/event/65512562447749138',
    name: '事件追踪',
    categories: ['new-media'],
    maintainers: ['DIYgod'],
    parameters: { id: 'Event ID from the share URL.' },
    description: 'Includes the latest entries on the public share page and their complete public article content.',
    radar: [{ source: ['h5-ol.sns.sohu.com/hy-moyukik-h5/share/event/:id'], target: '/event/:id' }],
    handler,
};

async function getData(url: string) {
    const response = await ofetch(url);
    const $ = load(response);
    const script = $('script:contains("window.__NUXT__")').text();
    if (!script) {
        return;
    }
    const data = await evaluateScriptData<{ data: any[] }>(script, '__NUXT__');
    return data.data[0];
}

function getItem(entry) {
    const link = `${baseUrl}/share/feed/${entry.id}`;
    return cache.tryGet(link, async () => {
        const data = await getData(link);
        const feed = data?.feed || entry;
        return {
            title: feed.title || entry.title,
            link,
            author: feed.source?.name,
            pubDate: feed.displayTime || entry.displayTime ? parseDate(feed.displayTime || entry.displayTime, 'x') : undefined,
            description: feed.content || `<p>${escapeText(feed.text || '')}</p>`,
            category: feed.tags,
        };
    });
}

async function handler(ctx) {
    const link = `${baseUrl}/share/event/${ctx.req.param('id')}`;
    const data = await getData(link);
    if (!data?.topicInfo) {
        throw new Error('This event has no public share data. Check the event ID and its public availability.');
    }
    const items = await pMap(data.feedList, getItem, { concurrency: 3 });
    return { title: `摸鱼 kik - ${data.topicInfo.title}`, link, description: data.topicInfo.description, language: 'zh-CN' as const, item: items };
}
