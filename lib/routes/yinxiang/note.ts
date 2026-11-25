import { load } from 'cheerio';
import { encodeXML } from 'entities';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

type ListedItem = DataItem & {
    link: string;
};
type NoteDetails = Pick<DataItem, 'category' | 'description' | 'pubDate'>;
function extractNoteContent(description: string, noteGuid: string): string {
    if (!description.startsWith('<?xml')) {
        return description;
    }
    const outer = load(description, { xml: true });
    const resources = new Map(
        outer('en-export > note > resource')
            .toArray()
            .map((element) => [outer(element).find('resource-attributes > file-name').text(), outer(element).find('resource-attributes > source-url').text()])
    );
    // ENEX exports store the ENML document inside the content element's CDATA.
    const document = outer('en-export > note > content').text();
    const note = load(document, { xml: { withStartIndices: true, withEndIndices: true } })('en-note');
    const children = note.contents().toArray();
    const start = children[0].startIndex;
    const end = children.at(-1)!.endIndex;
    if (typeof start !== 'number' || typeof end !== 'number') {
        throw new TypeError(`Could not locate ENML content for note ${noteGuid}`);
    }
    let content = document.slice(start, end + 1);
    const streamLines = note.find('en-media').toArray().toReversed();
    // Replace references from the end so the original XML offsets remain valid.
    for (const media of streamLines) {
        const url = resources.get(media.attribs.hash);
        if (!url) {
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
        const image = `<img src="${encodeXML(url)}"${attributes}>`;
        content = content.slice(0, from - start) + image + content.slice(to - start + 1);
    }
    return content;
}
async function fetchNoteDetails(noteGuid: string): Promise<NoteDetails> {
    const response = await ofetch(`https://app.yinxiang.com/third/discovery/client/restful/public/blog-note?noteGuid=${noteGuid}`);
    const description = response.blogNote.htmlContent;
    return {
        pubDate: parseDate(Number(response.blogNote.publishTime)),
        description: extractNoteContent(description, noteGuid),
        category: response.blogNote.tags ? response.blogNote.tags.split('|') : undefined,
    };
}
export const route: Route = {
    path: '/note',
    categories: ['study'],
    example: '/yinxiang/note',
    name: '印象剪藏',
    maintainers: ['nczitzk'],
    handler,
};
async function handler() {
    const apiUrl = 'https://app.yinxiang.com/third/discovery/client/restful/public/v2/discovery/homepage?notePageSize=20';
    const response = await ofetch(apiUrl);
    const list: ListedItem[] = response.blogNote.slice(0, 5).map((item) => ({
        title: item.title,
        link: `https://www.yinxiang.com/everhub/note/${item.noteGuid}`,
        pubDate: parseDate(Number(item.publishTime)),
        author: item.userNickname,
    }));
    const items = await pMap(
        list,
        async (item) => {
            const noteGuid = item.link.split('/note/', 2)[1];
            const details = await cache.tryGet<NoteDetails>(`yinxiang:detail:v4:${noteGuid}`, () => fetchNoteDetails(noteGuid));
            return {
                ...item,
                description: details.description,
                category: details.category,
            };
        },
        { concurrency: 3, stopOnError: false }
    );
    return {
        title: '印象剪藏 - 印象识堂',
        link: 'https://www.yinxiang.com/everhub/',
        item: items,
    };
}
