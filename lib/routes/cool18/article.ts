import { load } from 'cheerio';
import { FetchError } from 'ofetch';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export async function getArticle(item: DataItem): Promise<DataItem | undefined> {
    let detail: { description?: string; datePublished: string; author: string };
    try {
        detail = await cache.tryGet(`cool18:article:${item.link}`, async () => {
            const response = await ofetch(item.link!);
            const $ = load(response);
            const metadata = JSON.parse($('script[type="application/ld+json"]').text());
            return {
                description: $('pre').html()?.replaceAll('<font color="#E6E6DD">cool18.com</font>', ''),
                datePublished: metadata.datePublished,
                author: metadata.author.name,
            };
        });
    } catch (error) {
        if (error instanceof FetchError && error.statusCode === 404) {
            return;
        }
        throw error;
    }
    return {
        ...item,
        description: detail.description,
        author: item.author || detail.author,
        pubDate: parseDate(detail.datePublished),
    };
}
