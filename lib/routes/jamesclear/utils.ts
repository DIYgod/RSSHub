import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate, parseDateStrict } from '@/utils/time';

export const rootUrl = 'https://jamesclear.com';
const apiUrl = `${rootUrl}/wp-json/wp/v2`;

export async function fetchContent(endpoint: string) {
    const response = await ofetch(`${apiUrl}/${endpoint}`);
    return response;
}

export function processItem(item: any): DataItem {
    return {
        title: item.title.rendered,
        link: item.link,
        description: item.content.rendered,
        pubDate: item.date_gmt && parseDateStrict(item.date_gmt, 'YYYY-MM-DDTHH:mm:ss') ? parseDate(`${item.date_gmt}Z`) : undefined,
        author: 'James Clear',
        guid: item.guid.rendered,
    };
}
