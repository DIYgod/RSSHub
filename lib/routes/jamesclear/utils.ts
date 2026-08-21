import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const rootUrl = 'https://jamesclear.com';
export const apiUrl = `${rootUrl}/wp-json/wp/v2`;

export async function fetchContent(endpoint: string) {
    const response = await ofetch(`${apiUrl}/${endpoint}`);
    return response;
}

export function processItem(item: any): DataItem {
    return {
        title: item.title.rendered,
        link: item.link,
        description: item.content.rendered,
        pubDate: parseDate(item.date_gmt),
        author: 'James Clear',
        guid: item.guid.rendered,
    };
}
