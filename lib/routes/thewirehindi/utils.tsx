import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem } from '@/types';
import { parseDate } from '@/utils/parse-date';

const renderDescription = (excerpt, image, altText, content) =>
    renderToString(
        <>
            {excerpt ? <>{raw(excerpt)}</> : null}
            <br />
            <br />
            {image ? (
                <>
                    <img src={image} alt={altText} style="max-width: 100%; height: auto;" />
                    <br />
                    <br />
                </>
            ) : null}
            {content ? <>{raw(content)}</> : null}
        </>
    );

export function mapPostToItem(post): DataItem {
    const featuredMedia = post._embedded?.['wp:featuredmedia']?.find((v) => v.id === post.featured_media);
    const image = featuredMedia?.source_url;
    const altText = featuredMedia?.alt_text || featuredMedia?.title?.rendered || 'Featured Image';
    return {
        title: post.title.rendered,
        description: renderDescription(post.excerpt.rendered, image, altText, post.content.rendered),
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
