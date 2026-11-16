import { type CheerioAPI, load } from 'cheerio';
import type { Element } from 'domhandler';
import { escapeAttribute, escapeText } from 'entities';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const rootUrl = 'https://www.tryprofound.com';
export const researchUrl = `${rootUrl}/research`;

interface ResearchTag {
    label: string;
    slug: string;
}

interface ResearchAuthor {
    fullName?: string;
    avatar?: string;
}

interface ResearchItemBase {
    _id: string;
    title: string;
    href?: string;
    publicationDate?: string;
    authors?: ResearchAuthor[];
    tags?: ResearchTag[];
}

interface ResearchArticle extends ResearchItemBase {
    _type: 'researchArticle';
    slug?: string;
    url?: string;
    coverImage?: string;
}

interface ResearchSocialPost extends ResearchItemBase {
    _type: 'researchSocialPost';
    excerpt?: string;
    researchSocialPostChannel?: {
        label?: string;
        slug?: string;
    };
}

interface ResearchEbook extends ResearchItemBase {
    _type: 'researchEbook';
    subtitle?: string;
}

export type ResearchItem = ResearchArticle | ResearchSocialPost | ResearchEbook;

export const typeLabels: Record<ResearchItem['_type'], string> = {
    researchArticle: 'Article',
    researchSocialPost: 'Post',
    researchEbook: 'E-book',
};

// The site reserves these `?filter=` values for content types; every other value is a tag slug.
export const typeFilters = new Map<string, { type: ResearchItem['_type']; label: string }>([
    ['article', { type: 'researchArticle', label: 'Articles' }],
    ['post', { type: 'researchSocialPost', label: 'Posts' }],
    ['ebook', { type: 'researchEbook', label: 'E-books' }],
]);

const flightChunkPattern = /self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)/g;

const decodeFlightData = (html: string): string => {
    const chunks: string[] = [];
    for (const match of html.matchAll(flightChunkPattern)) {
        try {
            const decoded = JSON.parse(match[1]);
            if (typeof decoded === 'string') {
                chunks.push(decoded);
            }
        } catch {
            // Ignore malformed RSC flight chunks
        }
    }
    return chunks.join('');
};

// Returns the JSON array that follows `key`, skipping brackets inside string literals.
const extractJsonArray = (text: string, key: string): string | undefined => {
    const keyIndex = text.indexOf(key);
    if (keyIndex === -1) {
        return undefined;
    }
    const start = keyIndex + key.length - 1;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = start; index < text.length; index++) {
        const char = text[index];
        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (char === '\\') {
                escaped = true;
            } else if (char === '"') {
                inString = false;
            }
            continue;
        }
        switch (char) {
            case '"':
                inString = true;
                break;
            case '[':
            case '{':
                depth++;
                break;
            case ']':
            case '}':
                depth--;
                if (depth === 0) {
                    return text.slice(start, index + 1);
                }
                break;
            default:
                break;
        }
    }
    return undefined;
};

export const fetchResearchItems = async (): Promise<ResearchItem[]> => {
    const html = await ofetch(researchUrl, { responseType: 'text' });
    const json = extractJsonArray(decodeFlightData(html), '"researchItems":[');
    if (!json) {
        throw new Error(`Could not find research items on ${researchUrl}. The page structure may have changed.`);
    }
    return JSON.parse(json) as ResearchItem[];
};

// Decodes Cloudflare's email obfuscation (`/cdn-cgi/l/email-protection#<hex>`).
const decodeCloudflareEmail = (encoded: string): string => {
    const key = Number.parseInt(encoded.slice(0, 2), 16);
    let email = '';
    for (let index = 2; index < encoded.length; index += 2) {
        email += String.fromCodePoint(Number.parseInt(encoded.slice(index, index + 2), 16) ^ key);
    }
    return email;
};

const unwrap = ($: CheerioAPI, element: Element) => {
    $(element).replaceWith($(element).contents());
};

const cleanArticleContent = ($: CheerioAPI, link: string): string | undefined => {
    const content = $('div.post-content').first();
    if (content.length === 0) {
        return undefined;
    }

    // Decorative elements: heading link icons and the animated duplicate of pull quotes.
    content.find('[aria-hidden="true"], svg, script, style, noscript, button').remove();
    // Heading self-anchors and image zoom wrappers
    for (const element of content.find('a[href^="#"], div[data-rmiz], div[data-rmiz-content]').toArray()) {
        unwrap($, element);
    }
    for (const element of content.find('a[href*="/cdn-cgi/l/email-protection#"]').toArray()) {
        const encoded = $(element).attr('href')!.split('#', 2)[1];
        $(element).attr('href', `mailto:${decodeCloudflareEmail(encoded)}`);
    }
    for (const element of content.find('a[href], img[src], iframe[src]').toArray()) {
        const attribute = element.tagName === 'a' ? 'href' : 'src';
        const value = $(element).attr(attribute)!;
        if (!value.startsWith('mailto:')) {
            $(element).attr(attribute, new URL(value, link).href);
        }
    }
    // Site styles target a dark theme and would render poorly in feed readers.
    content.find('*').removeAttr('class').removeAttr('style').removeAttr('data-nimg').removeAttr('data-sanity-edit-target').removeAttr('loading').removeAttr('decoding');

    return content.html() ?? undefined;
};

export const fetchArticleContent = (link: string): Promise<string> =>
    cache.tryGet(`tryprofound:blog:${link}`, async () => {
        const html = await ofetch(link, { responseType: 'text' });
        const content = cleanArticleContent(load(html), link);
        if (!content) {
            throw new Error(`Could not find the article body (div.post-content) on ${link}. The page structure may have changed.`);
        }
        return content;
    });

export const renderImage = (src: string, alt: string) => `<figure><img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}"></figure>`;

export const renderText = (text: string) =>
    text
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `<p>${escapeText(line)}</p>`)
        .join('');
