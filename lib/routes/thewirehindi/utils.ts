import { DataItem } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { getCurrentPath } from '@/utils/helpers';

const __dirname = getCurrentPath(import.meta.url);

export function mapPostToItem(post): DataItem {
    return {
        title: post.title.rendered,
        description: art(path.join(__dirname, 'templates/description.art'), {
            excerpt: post.excerpt.rendered,
            content: post.content.rendered,
        }),
        link: post.link,
        pubDate: parseDate(post.date_gmt),
        updated: parseDate(post.modified_gmt),
        itunes_item_image: post._embedded?.['wp:featuredmedia']?.find((v) => v.id === post.featured_media)?.source_url,
        author:
            post._embedded?.author
                ?.map((v) => ({
                    name: v.name,
                    url: v.link,
                    avatar: v.avatar_urls?.['96'] || v.avatar_urls?.['48'] || v.avatar_urls?.['24'],
                }))
                .join(', ') || 'The Wire Hindi',
        category: post._embedded?.['wp:term']?.flat().map((v) => v.name),
    } as DataItem;
}
