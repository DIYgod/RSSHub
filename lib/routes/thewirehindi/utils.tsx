import type { DataItem } from '@/types';
import { parseDate } from '@/utils/parse-date';

export function mapFeedItem(item): DataItem {
    const image = item.enclosure?.url;
    return {
        title: item.title ?? '',
        description: item['content:encoded'] ?? item.content ?? item.contentSnippet,
        link: item.link,
        pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
        itunes_item_image: image,
        image,
        author: item.creator ?? item.author,
        category: item.categories,
    };
}
