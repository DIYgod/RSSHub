import type { DataItem } from '@/types';

type IdentifiedItem = DataItem & { sourceId?: string };

const keyFor = (item: IdentifiedItem, baseUrl: string) => (item.link ? (URL.parse(item.link, baseUrl)?.href ?? item.link) : item.title);

export function distinguishDuplicateGuids(items: IdentifiedItem[], prefix: string, baseUrl: string): DataItem[] {
    const primaryIds = new Map<string, string | undefined>();
    for (const item of items) {
        const key = keyFor(item, baseUrl);
        const primary = primaryIds.get(key);
        // Keep the existing link GUID on the lowest source ID, regardless of feed order.
        if (!primaryIds.has(key) || item.sourceId === undefined || (primary !== undefined && item.sourceId < primary)) {
            primaryIds.set(key, item.sourceId);
        }
    }

    const seen = new Set<string>();
    const seenIds = new Set<string>();
    return items.flatMap(({ sourceId, ...item }) => {
        const key = keyFor(item, baseUrl);
        const guid = sourceId !== undefined && sourceId !== primaryIds.get(key) ? `${prefix}${sourceId}` : undefined;
        if (seen.has(guid ?? key) || (sourceId !== undefined && seenIds.has(sourceId))) {
            return [];
        }
        seen.add(guid ?? key);
        if (sourceId !== undefined) {
            seenIds.add(sourceId);
        }
        return { ...item, guid };
    });
}
