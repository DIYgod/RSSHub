import type { CheerioAPI } from 'cheerio';

import type { DataItem } from '@/types';

type Attachment = NonNullable<DataItem['attachments']>[number];

const mimeTypes: Record<string, string> = {
    avif: 'image/avif',
    gif: 'image/gif',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    m4a: 'audio/mp4',
    m4v: 'video/mp4',
    mov: 'video/quicktime',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    oga: 'audio/ogg',
    ogg: 'audio/ogg',
    ogv: 'video/ogg',
    pdf: 'application/pdf',
    png: 'image/png',
    svg: 'image/svg+xml',
    wav: 'audio/wav',
    webm: 'video/webm',
    webp: 'image/webp',
    zip: 'application/zip',
};

export const getItemAttachments = (item: DataItem): Attachment[] => {
    const attachments = [...(item.attachments || [])];
    if (item.enclosure_url && attachments.every((attachment) => attachment.url !== item.enclosure_url)) {
        attachments.unshift({
            url: item.enclosure_url,
            mime_type: item.enclosure_type || 'application/octet-stream',
            title: item.enclosure_title,
            size_in_bytes: item.enclosure_length,
            duration_in_seconds: typeof item.itunes_duration === 'number' ? item.itunes_duration : undefined,
        });
    }
    return attachments;
};

export const extractAttachments = ($: CheerioAPI, item: DataItem, hideImages = false): Attachment[] => {
    const attachments = getItemAttachments(item);
    const seen = new Set(attachments.map((attachment) => attachment.url));
    // Prefer playable media when a reader supports only one enclosure.
    const elements = [...$('audio[src], video[src], audio source[src], video source[src]').toArray(), ...$('img[src], a[href]').toArray()];
    for (const element of elements) {
        const node = $(element);
        const source = node.attr(element.tagName === 'a' ? 'href' : 'src');
        if (!source) {
            continue;
        }
        let url: URL;
        try {
            url = new URL(source, item.link);
        } catch {
            continue;
        }
        if (!['https:', 'http:'].includes(url.protocol) || seen.has(url.href)) {
            continue;
        }
        const extension = url.pathname.split('.').at(-1)?.toLowerCase();
        const declaredType = node.attr('type')?.split(';', 1)[0].trim().toLowerCase();
        const mimeType = declaredType && /^(?:audio|video|image|application)\/[a-z0-9][a-z0-9.+-]*$/.test(declaredType) ? declaredType : extension && Object.hasOwn(mimeTypes, extension) ? mimeTypes[extension] : undefined;
        if (!mimeType || mimeType === 'application/xhtml+xml' || (hideImages && mimeType.startsWith('image/'))) {
            continue;
        }
        seen.add(url.href);
        attachments.push({ url: url.href, mime_type: mimeType });
    }
    return attachments;
};
