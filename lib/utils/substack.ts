import { encodeXML } from 'entities';

import type { DataItem } from '@/types';
import { parseDate } from '@/utils/parse-date';

export type SubstackAuthor = {
    id?: number;
    name?: string;
    handle?: string;
    photo_url?: string;
    bio?: string;
};

export type SubstackPost = {
    id?: number;
    publication_id?: number;
    title?: string;
    slug?: string;
    post_date?: string;
    canonical_url?: string;
    body_html?: string;
    cover_image?: string;
    publishedBylines?: SubstackAuthor[];
    postTags?: Array<{ name?: string }>;
};

export type SubstackPublicationResponse = {
    pub?: {
        author_id?: number;
        primary_user_id?: number;
        author_handle?: string;
        author_name?: string;
        author_photo_url?: string;
        hero_text?: string;
        logo_url?: string;
        base_url?: string;
    };
};

export type SubstackProfile = SubstackAuthor & {
    primaryPublication?: {
        logo_url?: string;
    };
};

type SubstackFeedItem = {
    title?: string;
    content?: string;
    link?: string;
    pubDate?: string;
    guid?: string;
    creator?: string;
    'content:encoded'?: string;
};

type SubstackRichTextMark = {
    type?: string;
    attrs?: {
        href?: string;
    };
};

type SubstackRichTextNode = {
    type?: string;
    text?: string;
    attrs?: {
        level?: number;
    };
    marks?: SubstackRichTextMark[];
    content?: SubstackRichTextNode[];
};

type SubstackImageAttachment = {
    type: 'image';
    imageUrl?: string;
    imageWidth?: number;
    imageHeight?: number;
};

type SubstackLinkAttachment = {
    type: 'link';
    linkMetadata?: {
        url?: string;
        host?: string;
        title?: string;
        description?: string;
        image?: string;
    };
};

export type SubstackNote = {
    id?: number;
    body?: string;
    body_json?: SubstackRichTextNode;
    date?: string;
    name?: string;
    handle?: string;
    photo_url?: string;
    attachments?: Array<SubstackImageAttachment | SubstackLinkAttachment | { type: string }>;
};

type SubstackAttachment = NonNullable<SubstackNote['attachments']>[number];

export type SubstackActivityItem = {
    type?: string;
    context?: {
        type?: string;
        timestamp?: string;
    };
    comment?: SubstackNote;
};

export type SubstackActivityFeed = {
    items?: SubstackActivityItem[];
};

export function getSubstackPostSlug(link?: string) {
    if (!link) {
        return;
    }

    try {
        const match = new URL(link).pathname.match(/^\/p\/([^/]+)/);
        return match?.[1];
    } catch {
        return;
    }
}

export function buildSubstackPostItem(feedItem: SubstackFeedItem, post: SubstackPost | undefined, user: string): DataItem {
    const link = post?.canonical_url || feedItem.link || (post?.slug ? `https://${user}.substack.com/p/${post.slug}` : undefined);
    const authors = post?.publishedBylines?.map((author) => author.name).filter((name): name is string => Boolean(name));
    const category = post?.postTags?.map((tag) => tag.name).filter((name): name is string => Boolean(name)) ?? [];
    const pubDate = post?.post_date || feedItem.pubDate;

    return {
        title: post?.title || feedItem.title || 'Untitled',
        description: post?.body_html || feedItem['content:encoded'] || feedItem.content || '',
        ...(link && { link }),
        ...(pubDate && { pubDate: parseDate(pubDate) }),
        ...((link || feedItem.guid) && { guid: link || feedItem.guid }),
        author: authors?.join(', ') || feedItem.creator || user,
        ...(category.length > 0 && { category }),
        ...(post?.cover_image && { image: post.cover_image }),
    };
}

export function isSubstackNote(item: SubstackActivityItem): item is SubstackActivityItem & { comment: SubstackNote } {
    return item.type === 'comment' && item.context?.type === 'note' && Boolean(item.comment?.id);
}

export function buildSubstackNoteItem(note: SubstackNote, profile: SubstackProfile): DataItem {
    const handle = note.handle || profile.handle;
    if (!handle || !note.id) {
        throw new Error('Unable to build a Substack Note without an author handle and note id');
    }

    const link = `https://substack.com/@${handle}/note/c-${note.id}`;
    const pubDate = note.date;
    const authorName = note.name || profile.name || handle;
    const authorAvatar = note.photo_url || profile.photo_url;

    return {
        title: note.body || `Note by ${note.name || profile.name || handle}`,
        description: renderSubstackNote(note),
        link,
        guid: link,
        ...(pubDate && { pubDate: parseDate(pubDate) }),
        author: [
            {
                name: authorName,
                url: `https://substack.com/@${handle}`,
                ...(authorAvatar && { avatar: authorAvatar }),
            },
        ],
    };
}

export function renderSubstackNote(note: SubstackNote) {
    const body = note.body_json?.content?.length ? renderRichTextNode(note.body_json) : renderPlainText(note.body || '');
    const attachments =
        note.attachments
            ?.map((attachment) => renderAttachment(attachment))
            .filter(Boolean)
            .join('\n') ?? '';

    return [body, attachments].filter(Boolean).join('\n');
}

function renderRichTextNode(node: SubstackRichTextNode): string {
    if (node.type === 'text') {
        let text = encodeXML(node.text || '');
        const marks = node.marks ?? [];
        for (const mark of marks) {
            switch (mark.type) {
                case 'bold':
                case 'strong':
                    text = `<strong>${text}</strong>`;
                    break;
                case 'em':
                case 'italic':
                    text = `<em>${text}</em>`;
                    break;
                case 'code':
                    text = `<code>${text}</code>`;
                    break;
                case 'strike':
                    text = `<s>${text}</s>`;
                    break;
                case 'link':
                    text = renderLinkMark(text, mark.attrs?.href);
                    break;
                default:
                    break;
            }
        }
        return text;
    }

    if (node.type === 'hardBreak') {
        return '<br>';
    }

    const content = node.content?.map((child) => renderRichTextNode(child)).join('') ?? '';
    if (node.type === 'paragraph') {
        return `<p>${content}</p>`;
    }
    if (node.type === 'blockquote') {
        return `<blockquote>${content}</blockquote>`;
    }
    if (node.type === 'bulletList') {
        return `<ul>${content}</ul>`;
    }
    if (node.type === 'orderedList') {
        return `<ol>${content}</ol>`;
    }
    if (node.type === 'listItem') {
        return `<li>${content}</li>`;
    }
    if (node.type === 'heading') {
        const level = Math.min(Math.max(node.attrs?.level ?? 2, 1), 6);
        return `<h${level}>${content}</h${level}>`;
    }

    return content;
}

function renderLinkMark(text: string, value?: string) {
    const href = getSafeUrl(value);
    return href ? `<a href="${encodeXML(href)}">${text}</a>` : text;
}

function renderPlainText(text: string) {
    if (!text) {
        return '';
    }

    return text
        .split(/\n{2,}/)
        .map((paragraph) => `<p>${encodeXML(paragraph).replaceAll('\n', '<br>')}</p>`)
        .join('');
}

function renderAttachment(attachment: SubstackAttachment) {
    if (attachment.type === 'image' && 'imageUrl' in attachment) {
        const imageUrl = getSafeUrl(attachment.imageUrl);
        if (!imageUrl) {
            return '';
        }

        const width = attachment.imageWidth ? ` width="${attachment.imageWidth}"` : '';
        const height = attachment.imageHeight ? ` height="${attachment.imageHeight}"` : '';
        return `<p><img src="${encodeXML(imageUrl)}"${width}${height}></p>`;
    }

    if (attachment.type === 'link' && 'linkMetadata' in attachment) {
        const metadata = attachment.linkMetadata;
        const url = getSafeUrl(metadata?.url);
        if (!url) {
            return '';
        }

        const imageUrl = getSafeUrl(metadata?.image);
        const title = metadata?.title || metadata?.host || url;
        const image = imageUrl ? `<img src="${encodeXML(imageUrl)}" alt="${encodeXML(title)}">` : '';
        const description = metadata?.description ? `<figcaption>${encodeXML(metadata.description)}</figcaption>` : '';
        return `<figure><a href="${encodeXML(url)}">${image}<strong>${encodeXML(title)}</strong></a>${description}</figure>`;
    }

    return '';
}

function getSafeUrl(value?: string) {
    if (!value) {
        return;
    }

    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined;
    } catch {
        return;
    }
}
