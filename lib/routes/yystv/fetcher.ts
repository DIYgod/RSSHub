import { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export async function fetchArticleContentCached(link: string): Promise<string> {
    const result = await cache.tryGet(link, () => ofetch(link));

    if (typeof result === 'string') {
        return result;
    }

    return '';
}

export async function fetchDataItemCached(link: string, processor: (articleContent: string) => DataItem): Promise<DataItem> {
    const dataItemKey = `dataitem:${link}`;
    const result = await cache.tryGet(dataItemKey, async () => {
        const result = await fetchArticleContentCached(link);
        const processedItem = processor(result);

        return processedItem;
    });

    if (typeof result !== 'object') {
        const articleContent = await fetchArticleContentCached(link);
        const processedItem = processor(articleContent);

        cache.set(dataItemKey, processedItem);

        return processedItem;
    }

    return result as DataItem;
}
