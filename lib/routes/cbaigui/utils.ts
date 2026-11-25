import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const rootUrl = 'https://cbaigui.com';
export const apiUrl = 'https://api-web.cbaigui.com/v1';

interface Filter {
    id: string | number;
    name: string;
}

export async function getFilterId(type: 'attributes' | 'books', name: string) {
    const url = `${apiUrl}/monster/${type}`;
    const data = await cache.tryGet(url, async () => (await ofetch<{ data: Filter[] }>(url)).data);
    return data.find((filter) => filter.name === name && (type === 'books' || String(filter.id).startsWith('a_')))?.id;
}
