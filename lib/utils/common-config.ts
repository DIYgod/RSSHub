import { type Cheerio, load } from 'cheerio';
import type { AnyNode } from 'domhandler';
import iconv from 'iconv-lite';

import type { Data, DataItem } from '@/types';
import ofetch from '@/utils/ofetch';

type Selector = (selector: string) => Cheerio<AnyNode>;
type Value<T> = T | ((select: Selector) => T);
type ItemFields = Pick<DataItem, 'title' | 'description' | 'pubDate' | 'link' | 'guid'>;

type BuildDataConfig = Pick<Data, 'link' | 'author' | 'allowEmpty'> & {
    url: string;
    title: Value<Data['title']>;
    description?: Value<Data['description']>;
    item: { item: string } & { [Key in keyof ItemFields]: Value<ItemFields[Key]> };
};

function resolveValue<T>(value: Value<T>, select: Selector): T {
    return typeof value === 'function' ? (value as (select: Selector) => T)(select) : value;
}

export default async function buildData(data: BuildDataConfig) {
    const response = await ofetch.raw(data.url);
    const contentType = response.headers.get('content-type') || '';
    // Default to UTF-8 when no encoding is specified.
    let charset = 'utf-8';
    for (const attr of contentType.split(';')) {
        if (attr.includes('charset=')) {
            charset = (attr.split('=').pop() || 'utf-8').toLowerCase();
        }
    }
    const responseData = charset === 'utf-8' ? response._data : iconv.decode(Buffer.from(await ofetch(data.url, { responseType: 'arrayBuffer' })), charset);
    const $ = load(responseData);
    return {
        link: data.link,
        title: resolveValue(data.title, $),
        description: resolveValue(data.description, $),
        allowEmpty: data.allowEmpty || false,
        item: $(data.item.item)
            .toArray()
            .map((element) => {
                const select: Selector = (selector) => $(element).find(selector);
                return {
                    title: resolveValue(data.item.title, select),
                    description: resolveValue(data.item.description, select),
                    pubDate: resolveValue(data.item.pubDate, select),
                    link: resolveValue(data.item.link, select),
                    guid: resolveValue(data.item.guid, select),
                };
            }),
    };
}
