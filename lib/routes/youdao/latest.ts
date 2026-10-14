import { escapeAttribute, escapeText } from 'entities';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

type Collection = {
    name: string;
    title: string;
    time: number;
    shareKey: string;
    type: 'note' | 'notebook';
};
function parsePublishedDate(value: unknown) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
export const route: Route = {
    path: '/latest',
    categories: ['study'],
    example: '/youdao/latest',
    name: '笔记最新动态',
    maintainers: ['nczitzk'],
    handler,
};
async function handler() {
    const rootUrl = 'https://xueba.youdao.com';
    const apiUrl = `${rootUrl}/yws/mapi/xueba/library?method=realTimeCollect&count=10`;
    const response = await ofetch<{
        Clt: Collection[];
    }>(apiUrl, {
        headers: {
            Referer: `${rootUrl}/web/index.html`,
        },
        parseResponse: JSON.parse,
    });
    const list = response.Clt.map((item) => ({
        type: item.type,
        title: `${item.name} 保存了 ${item.title}`,
        pubDate: parsePublishedDate(item.time),
        link: `https://note.youdao.com/publicshare/?id=${item.shareKey}`,
        guid: `${item.shareKey}:${item.time}:${item.name}`,
    }));
    const items = await pMap(
        list,
        async (item) => {
            if (item.type !== 'note' && item.type !== 'notebook') {
                throw new Error('Unsupported Youdao shared content type');
            }
            const article = await cache.tryGet(`youdao:latest:v4:${item.type}:${item.link}`, async () => {
                const id = item.link.split('?id=', 2)[1];
                const contentResponse = await ofetch(`https://note.youdao.com/yws/public/${item.type}/${id}`, { parseResponse: JSON.parse });
                let description: string | undefined;
                if (item.type === 'notebook') {
                    const notes = contentResponse[2];
                    description = notes.map((note) => `<h3><a href="${escapeAttribute(`https://note.youdao.com/publicshare?id=${id}#${note.p}`)}">${escapeText(note.tl)}</a></h3>`).join('');
                } else {
                    if (typeof contentResponse.content !== 'string') {
                        throw new TypeError('Youdao shared note response is missing its text content');
                    }
                    description = contentResponse.content;
                }
                return { description };
            });
            const metadata = omitInternalField(item, 'type');
            return { ...metadata, ...article };
        },
        { concurrency: 3, stopOnError: false }
    );
    return {
        title: '笔记最新动态 - 有道云笔记',
        link: `${rootUrl}/web/index.html`,
        item: items,
    };
}
function omitInternalField<T extends object, K extends keyof T>(item: T, key: K): Omit<T, K> {
    const metadata = { ...item };
    delete metadata[key];
    return metadata;
}
