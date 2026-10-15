import { escapeAttribute, escapeText } from 'entities';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

type Note = {
    type: 'note' | 'notebook';
    title: string;
    userId: string;
    description: string;
    upt: number;
    id: string;
};
function parsePublishedDate(value: unknown) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
export const route: Route = {
    path: '/xueba',
    categories: ['study'],
    example: '/youdao/xueba',
    name: '学霸感悟',
    maintainers: ['nczitzk'],
    handler,
};
async function handler() {
    const rootUrl = 'https://xueba.youdao.com';
    const apiUrl = `${rootUrl}/yws/mapi/xueba/library?method=search`;
    const response = await ofetch<{
        notes: Note[];
        xuebas: Array<{
            uid: string;
            name: string;
        }>;
    }>(apiUrl, {
        method: 'POST',
        headers: {
            Referer: `${rootUrl}/web/index.html`,
        },
        parseResponse: JSON.parse,
        body: new URLSearchParams({
            keyword: '',
            begin: '0',
            count: '9',
            primary_category: '4',
        }),
    });
    const authors: Record<string, string> = {};
    const streamLines = response.xuebas;
    for (const author of streamLines) {
        authors[author.uid] = author.name;
    }
    const list = response.notes.map((item) => ({
        type: item.type,
        title: item.title,
        author: item.userId,
        description: item.description,
        pubDate: parsePublishedDate(item.upt),
        link: `http://note.youdao.com/publicshare/?type=${item.type}&id=${item.id}`,
    }));
    const items = await pMap(
        list,
        async (item) => {
            if (item.type !== 'note' && item.type !== 'notebook') {
                throw new Error('Unsupported Youdao shared content type');
            }
            let description: string | undefined = item.description;
            try {
                const article = await cache.tryGet(`youdao:xueba:v3:${item.link}`, async () => {
                    const id = item.link.split('&id=', 2)[1];
                    const contentResponse = await ofetch(`http://note.youdao.com/yws/public/${item.type}/${id}`, { parseResponse: JSON.parse });
                    let description: string | undefined;
                    if (item.type === 'note') {
                        if (typeof contentResponse.content !== 'string') {
                            throw new TypeError('Youdao shared note response is missing its text content');
                        }
                        description = contentResponse.content;
                    } else {
                        const notes = contentResponse[2];
                        description = notes.map((note) => `<h3><a href="${escapeAttribute(`http://note.youdao.com/publicshare?id=${id}#${note.p}`)}">${escapeText(note.tl)}</a></h3>`).join('');
                    }
                    return { description };
                });
                description = article.description;
            } catch (error) {
                if (!(error instanceof FetchError) || error.statusCode !== 500 || error.data?.error !== '1008' || error.data?.scope !== 'PREVIOUS_EXCEPTION' || error.data?.canTryAgain !== false) {
                    throw error;
                }
            }
            const metadata = omitInternalField(item, 'type');
            return { ...metadata, description, author: authors[item.author] };
        },
        { concurrency: 3, stopOnError: false }
    );
    return {
        title: '学霸感悟 - 有道云笔记',
        link: `${rootUrl}/web/index.html#4`,
        item: items,
    };
}
function omitInternalField<T extends object, K extends keyof T>(item: T, key: K): Omit<T, K> {
    const metadata = { ...item };
    delete metadata[key];
    return metadata;
}
