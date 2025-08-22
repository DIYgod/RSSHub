import { DataItem } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export function mapPostToItem(post): DataItem {
    const featuredMedia = post._embedded?.['wp:featuredmedia']?.find((v) => v.id === post.featured_media);
    const image = featuredMedia?.source_url;
    const altText = featuredMedia?.alt_text || featuredMedia?.title?.rendered || 'Featured Image';
    return {
        title: post.title.rendered,
        description: art(path.join(__dirname, 'templates/description.art'), {
            excerpt: post.excerpt.rendered,
            content: post.content.rendered,
            image,
            altText,
        }),
        link: post.link,
        pubDate: parseDate(post.date_gmt),
        updated: parseDate(post.modified_gmt),
        itunes_item_image: image,
        image,
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
