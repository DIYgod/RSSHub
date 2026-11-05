import pMap from 'p-map';

import type { DataItem } from '@/types';

export const fetchItems = <T extends DataItem>(items: T[], mapper: (item: T) => Promise<T>): Promise<T[]> => {
    const selected = items;
    return pMap(
        selected,
        async (item) => {
            const { title, link, pubDate } = item;
            const result = await mapper(item);
            return { ...result, title, link, pubDate: pubDate ?? result.pubDate };
        },
        { concurrency: 3 }
    );
};
