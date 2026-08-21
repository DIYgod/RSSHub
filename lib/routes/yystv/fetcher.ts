import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export function fetchDataItemCached(link: string, processor: (articleContent: string) => DataItem): Promise<DataItem> {
    return cache.tryGet(link, async () => {
        const page = await ofetch(link);
        return processor(page);
    }) as Promise<DataItem>;
}
