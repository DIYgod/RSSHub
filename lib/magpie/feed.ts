// A feed of the local RSSHub (its JSON Feed output) as text an agent reads.

interface JsonFeedItem {
    id?: string;
    url?: string;
    title?: string;
    content_html?: string;
    content_text?: string;
    summary?: string;
    date_published?: string;
    authors?: Array<{ name?: string }>;
    tags?: string[];
    attachments?: Array<{ url?: string; mime_type?: string }>;
}

export interface JsonFeed {
    title?: string;
    home_page_url?: string;
    description?: string;
    items?: JsonFeedItem[];
}

const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

const decode = (text: string) =>
    text.replaceAll(/&(#x[\da-f]+|#\d+|\w+);/gi, (whole, name: string) => {
        if (name.startsWith('#')) {
            const code = name[1].toLowerCase() === 'x' ? Number.parseInt(name.slice(2), 16) : Number(name.slice(1));
            return Number.isFinite(code) && code <= 0x10_ff_ff ? String.fromCodePoint(code) : whole;
        }
        return entities[name.toLowerCase()] ?? whole;
    });

/** HTML as plain text: paragraphs and line breaks kept, pictures named, everything else let go. */
export const htmlToText = (html: string) =>
    decode(
        html
            .replaceAll(/<(script|style)[\s\S]*?<\/\1>/gi, '')
            .replaceAll(/<img[^>]*?alt="([^"]+)"[^>]*>/gi, '[image: $1]')
            .replaceAll(/<img[^>]*>/gi, '[image]')
            .replaceAll(/<br\s*\/?>/gi, '\n')
            .replaceAll(/<\/(p|div|li|h[1-6]|blockquote|pre|tr)>/gi, '\n')
            .replaceAll(/<[^>]+>/g, '')
    )
        .replaceAll(/[ \t\f\v]+/g, ' ')
        .replaceAll(/\s*\n\s*/g, '\n')
        .trim();

const clip = (text: string, length: number) => (text.length > length ? `${text.slice(0, length).trimEnd()}…` : text);

export const formatFeed = (feed: JsonFeed, feedUrl: string, contentLength: number) => {
    const items = feed.items ?? [];
    const lines = [feed.title ? `# ${feed.title}` : '# (untitled feed)'];
    if (feed.home_page_url) {
        lines.push(`Website: ${feed.home_page_url}`);
    }
    lines.push(`Feed URL: ${feedUrl}`);
    const description = feed.description?.replace(/ - Powered by RSSHub$/, '');
    if (description && description !== feed.title) {
        lines.push(`About: ${description}`);
    }
    lines.push('', `${items.length} item${items.length === 1 ? '' : 's'}:`);
    for (const [i, item] of items.entries()) {
        lines.push('', `${i + 1}. ${item.title ? htmlToText(item.title) : '(untitled)'}`);
        if (item.url) {
            lines.push(`   ${item.url}`);
        }
        const meta = [
            item.date_published,
            item.authors
                ?.map((author) => author.name)
                .filter(Boolean)
                .join(', '),
            item.tags?.length ? `#${item.tags.slice(0, 8).join(' #')}` : '',
        ].filter(Boolean);
        if (meta.length) {
            lines.push(`   ${meta.join(' · ')}`);
        }
        const attachments = item.attachments ?? [];
        for (const attachment of attachments) {
            if (attachment.url) {
                lines.push(`   attachment: ${attachment.url}${attachment.mime_type ? ` (${attachment.mime_type})` : ''}`);
            }
        }
        if (contentLength === 0) {
            continue;
        }
        const content = item.content_html ? htmlToText(item.content_html) : (item.content_text ?? item.summary ?? '');
        if (content && content !== item.title) {
            lines.push(`   ${clip(content, contentLength).replaceAll('\n', '\n   ')}`);
        }
    }
    return lines.join('\n');
};
