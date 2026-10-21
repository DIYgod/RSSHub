import { load } from 'cheerio';

import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface APODPost {
    link: string;
    title: { rendered: string };
    content: { rendered: string };
    date_gmt?: string;
    parsely?: { meta?: { author?: Array<{ name: string }> } };
}

export async function getAPODItems(limit: number): Promise<DataItem[]> {
    const data = await ofetch<APODPost[]>('https://science.nasa.gov/wp-json/wp/v2/image-article', {
        query: { categories: 22766, per_page: Math.min(limit, 100) },
    });

    return data.map((post) => {
        const $ = load(post.content.rendered);
        const description = `${$('.media-detail-hero__media').html() ?? ''}${$('.media-detail-hero__description').prop('outerHTML') ?? ''}`;

        return {
            title: post.title.rendered,
            link: post.link,
            description,
            author: post.parsely?.meta?.author?.map((author) => author.name).join(', '),
            pubDate: post.date_gmt && post.date_gmt !== '0000-00-00T00:00:00' ? parseDate(`${post.date_gmt}Z`) : undefined,
        };
    });
}
