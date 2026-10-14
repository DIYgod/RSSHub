import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { renderFigure } from './templates/figure';
import { apiUrl, getFilterId, rootUrl } from './utils';

export const route: Route = {
    path: '/:path{.+}?',
    categories: ['new-media'],
    example: '/cbaigui',
    parameters: { path: '路径，默认为首页' },
    name: '通用',
    maintainers: ['nczitzk'],
    description: `默认订阅[首页](https://cbaigui.com)的妖怪词条、杂谈和站点公告。网站改版后，原分类和标签路径仍可作为路由参数，名称对应[妖怪列表](https://cbaigui.com/monster)中的属性或书籍筛选项。

| 筛选项   | 路径参数                           |
| -------- | ---------------------------------- |
| 妖怪词条 | monster                            |
| 杂谈     | essays                             |
| 站点公告 | notice                             |
| 妖       | post-tag / 妖                      |
| 埃及     | post-category / 世界 / 非洲 / 埃及 |
| 白泽图   | post-category / 词条 / 白泽图      |`,
    handler,
};

interface Monster {
    id: number;
    name: string;
    content: string;
    record_at: number;
    cover_img?: string;
    images?: string[];
    attrs: Array<{ attributes: Array<{ name: string }> }>;
    books: Array<{ name: string }>;
    literatures?: Array<{ origin: string; translate?: string }>;
}

interface Article {
    id: number;
    title: string;
    content: string;
    created_at: number;
    updated_at?: number;
    publish_at?: number;
    author?: { name: string };
}

type Entry = {
    id: number;
    kind: 'monsters' | 'articles' | 'announcements';
    pubDate: number;
    link: string;
};

async function getItem(entry: Entry): Promise<DataItem> {
    if (entry.kind === 'monsters') {
        const { data } = await ofetch<{ data: Monster }>(`${apiUrl}/monsters/${entry.id}`);
        const images = [...new Set([data.cover_img, ...(data.images ?? [])].filter((src): src is string => Boolean(src)))];
        const literature = (data.literatures ?? []).map((item) => `${item.origin}${item.translate ?? ''}`).join('');
        return {
            title: data.name,
            link: entry.link,
            description: images.map((src) => renderFigure({ src })).join('') + data.content + literature,
            category: [...new Set([...data.attrs.flatMap((group) => group.attributes.map((attribute) => attribute.name)), ...data.books.map((book) => book.name)])],
            guid: entry.link,
            pubDate: parseDate(data.record_at * 1000),
        };
    }
    const response = await ofetch<Article | { data: Article }>(`${apiUrl}/${entry.kind}/${entry.id}`);
    const data = 'data' in response ? response.data : response;
    return {
        title: data.title,
        link: entry.link,
        description: data.content,
        author: data.author?.name,
        pubDate: parseDate((data.publish_at || data.created_at) * 1000),
        updated: data.updated_at ? parseDate(data.updated_at * 1000) : undefined,
        guid: entry.link,
    };
}

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 50);
    const path = ctx.req.param('path') ?? '';
    const query: Record<string, string | number> = { page: 1, per_page: Math.max(limit, 50) };
    let filterName: string | undefined;
    let kinds: Array<Entry['kind']> = ['monsters', 'articles', 'announcements'];
    let currentUrl = rootUrl;
    const sections = { monster: { kind: 'monsters', name: '妖怪词条' }, essays: { kind: 'articles', name: '杂谈' }, notice: { kind: 'announcements', name: '站点公告' } } as const;

    if (path && Object.hasOwn(sections, path)) {
        const section = sections[path as keyof typeof sections];
        kinds = [section.kind];
        filterName = section.name;
        currentUrl = `${rootUrl}/${path}`;
    } else if (path) {
        const match = path.match(/^post-(tag|category)\/(.+)$/);
        if (!match) {
            throw new InvalidParameterError('Use monster, essays, notice, post-tag/<name> or post-category/<path> to choose a section or classification.');
        }
        const name = String(match[2]).split('/').pop()!;
        filterName = name;
        const type = match[2].startsWith('词条/') ? 'books' : 'attributes';
        const filterId = await getFilterId(type, name);
        if (filterId === undefined) {
            throw new InvalidParameterError(`Classification "${filterName}" is no longer available on the source website.`);
        }
        query[type === 'books' ? 'book_ids' : 'attribute_ids'] = String(filterId).replace(/^a_/, '');
        kinds = ['monsters'];
        currentUrl = `${rootUrl}/monster`;
    }

    const lists = await Promise.all(
        kinds.map(async (kind): Promise<Entry[]> => {
            const response = await ofetch<{ data: Array<Monster & Article> }>(`${apiUrl}/${kind}`, { query });
            const page = kind === 'monsters' ? 'monster' : kind === 'articles' ? 'essays' : 'notice';
            return response.data.map((entry) => ({
                id: entry.id,
                kind,
                pubDate: kind === 'monsters' ? entry.record_at : entry.publish_at || entry.created_at,
                link: `${rootUrl}/${page}/${entry.id}`,
            }));
        })
    );
    const entries = lists.flat();
    if (ctx.req.query('sorted') !== 'false') {
        entries.sort((a, b) => b.pubDate - a.pubDate);
    }
    const items = await Promise.all(entries.slice(0, limit).map((entry) => cache.tryGet(entry.link, () => getItem(entry))));

    return {
        item: items,
        title: `纪妖${filterName ? ` - ${filterName}` : ''}`,
        link: currentUrl,
        language: 'zh-CN' as const,
    };
}
