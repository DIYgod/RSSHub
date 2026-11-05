import { type CheerioAPI, load } from 'cheerio';
import { encodeXML } from 'entities';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

type ListedItem = DataItem & {
    link: string;
};
type NoteDetails = Pick<DataItem, 'category' | 'description' | 'pubDate'>;
function parsePublishTime(value?: string | number): Date | undefined {
    if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) {
        return;
    }
    const timestamp = Number(value);
    if (!Number.isFinite(timestamp)) {
        return;
    }
    const date = parseDate(timestamp);
    if (Number.isFinite(date.getTime())) {
        return date;
    }
    return;
}
type ImageResource = {
    url: string;
    mime: string;
};
function getImageResources(outer: CheerioAPI): Map<string, ImageResource> {
    const resources = new Map<string, ImageResource>();
    const conflictingHashes = new Set<string>();
    const streamLines = outer('en-export > note > resource').toArray();
    for (const element of streamLines) {
        const resource = outer(element);
        const hash = resource.find('resource-attributes > file-name').text();
        const mime = resource.find('mime').text();
        const url = resource.find('resource-attributes > source-url').text();
        if (!/^[a-f\d]{32}$/i.test(hash) || !/^image\/[a-z\d.+-]+$/i.test(mime) || conflictingHashes.has(hash)) {
            continue;
        }
        let address: URL;
        try {
            address = new URL(url);
        } catch {
            continue;
        }
        if (!['http:', 'https:'].includes(address.protocol) || address.username || address.password) {
            continue;
        }
        const previous = resources.get(hash);
        if (previous && (previous.url !== url || previous.mime !== mime)) {
            resources.delete(hash);
            conflictingHashes.add(hash);
        } else {
            resources.set(hash, { url, mime });
        }
    }
    return resources;
}
function extractNoteContent(description: string, noteGuid: string): string {
    if (!description.trimStart().startsWith('<?xml')) {
        return description;
    }
    const outer = load(description, { xml: { withStartIndices: true, withEndIndices: true } });
    let document = description;
    let note = outer('en-note');
    const exportedContent = outer('en-export > note > content');
    if (note.length === 0 && exportedContent.length === 1) {
        // ENEX exports store the ENML document inside the content element's CDATA.
        document = exportedContent.text();
        const inner = load(document, { xml: { withStartIndices: true, withEndIndices: true } });
        note = inner('en-note');
    }
    if (note.length !== 1) {
        throw new Error(`Expected one ENML root for note ${noteGuid}`);
    }
    const children = note.contents().toArray();
    if (children.length === 0) {
        return '';
    }
    const start = children[0].startIndex;
    const end = children.at(-1)!.endIndex;
    if (typeof start !== 'number' || typeof end !== 'number') {
        throw new TypeError(`Could not locate ENML content for note ${noteGuid}`);
    }
    let content = document.slice(start, end + 1);
    const resources = getImageResources(outer);
    const streamLines = note.find('en-media').toArray().toReversed();
    // Replace references from the end so the original XML offsets remain valid.
    for (const media of streamLines) {
        const resource = resources.get(media.attribs.hash);
        if (!resource || resource.mime !== media.attribs.type) {
            continue;
        }
        const from = media.startIndex;
        const to = media.endIndex;
        if (typeof from !== 'number' || typeof to !== 'number') {
            throw new TypeError(`Could not locate ENML media for note ${noteGuid}`);
        }
        const attributes = ['width', 'height', 'alt']
            .filter((name) => media.attribs[name] !== undefined)
            .map((name) => ` ${name}="${encodeXML(media.attribs[name])}"`)
            .join('');
        const image = `<img src="${encodeXML(resource.url)}"${attributes}>`;
        content = content.slice(0, from - start) + image + content.slice(to - start + 1);
    }
    return content;
}
function parseTags(value?: string): string[] | undefined {
    if (typeof value !== 'string') {
        return;
    }
    const tags = value.split('|').filter((tag) => tag.trim());
    return tags.length ? tags : undefined;
}
async function fetchNoteDetails(noteGuid: string): Promise<NoteDetails> {
    const response = await ofetch(`https://app.yinxiang.com/third/discovery/client/restful/public/blog-note?noteGuid=${noteGuid}`);
    const description = response.blogNote.htmlContent;
    return {
        pubDate: parsePublishTime(response.blogNote.publishTime),
        description: extractNoteContent(description, noteGuid),
        category: parseTags(response.blogNote.tags),
    };
}
export const route: Route = {
    path: '/card/:id?',
    categories: ['study'],
    example: '/yinxiang/card/32',
    parameters: { id: '卡片 id，见下表，默认为每周收藏排行榜・TOP5' },
    name: '卡片清单',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
卡片对应的话题、专题等内容过期后，该卡片 id 也会失效，此时填入该卡片 id 将会报错。
:::

| 每周收藏排行榜・TOP5 | 每周热门「读书笔记」榜 TOP5 | 【印象话题】选择的悖论 | 【印象专题】如何一秒洞察问题本质？ | 「识堂开讲」5 位嘉宾精华笔记大放送 | 【印象话题】培养专注力的 5 个步骤 | 🎁 购物清单主题活动获奖结果 |
| -------------------- | --------------------------- | ---------------------- | ---------------------------------- | ---------------------------------- | --------------------------------- | --------------------------- |
| 32                   | 33                          | 101                    | 103                                | 104                                | 105                               | 106                         |`,
};
async function handler(ctx: Context) {
    const { id = '32' } = ctx.req.param();
    const apiUrl = `https://app.yinxiang.com/third/discovery/client/restful/public/discovery/card-holder?cardHolderId=${id}`;
    const response = await ofetch(apiUrl);
    const list: ListedItem[] = response.card.map((item) => ({
        title: item.title,
        link: item.url,
        author: item.userNickname,
    }));
    const items = await pMap(
        list,
        async (item) => {
            const noteGuid = item.link.split('/note/', 2)[1];
            const details = await cache.tryGet<NoteDetails>(`yinxiang:detail:v4:${noteGuid}`, () => fetchNoteDetails(noteGuid));
            return {
                ...item,
                link: item.link,
                pubDate: details.pubDate,
                description: details.description,
                category: details.category,
            };
        },
        { concurrency: 3, stopOnError: false }
    );
    return {
        title: `${response.name} - 印象识堂`,
        link: 'https://www.yinxiang.com/everhub/',
        item: items,
    };
}
