import { load } from 'cheerio';

// Allowed HTML tags for sanitization
const ALLOWED_TAGS = new Set(['div', 'span', 'p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'a', 'img', 'ul', 'ol', 'li', 'blockquote', 'hr', 'pre', 'code']);

// Allowed attributes for each tag
const ALLOWED_ATTRS: Record<string, Set<string>> = {
    a: new Set(['href', 'target', 'rel']),
    img: new Set(['src', 'alt', 'title', 'style']),
    div: new Set(['style']),
    span: new Set(['style']),
    pre: new Set(),
    code: new Set(),
};

// Tags to completely remove (including content)
const REMOVE_TAGS = new Set(['button', 'script', 'style', 'noscript']);

/**
 * Sanitize HTML content by removing disallowed tags and attributes
 */
export const sanitizeHtml = (html: string): string => {
    const $ = load(html);

    // First, completely remove certain tags
    for (const tag of REMOVE_TAGS) {
        $(tag).remove();
    }

    // Remove disallowed tags but keep their content (process from innermost to outermost)
    let changed = true;
    while (changed) {
        changed = false;
        $('*').each((_, el) => {
            if (el.type !== 'tag') {
                return;
            }
            const $el = $(el);
            const tagName = el.name.toLowerCase();

            if (!ALLOWED_TAGS.has(tagName)) {
                $el.replaceWith($el.html() || '');
                changed = true;
                return false; // Break and restart iteration
            }
        });
    }

    // Clean attributes - only keep allowed ones
    $('*').each((_, el) => {
        if (el.type !== 'tag') {
            return;
        }
        const $el = $(el);
        const tagName = el.name.toLowerCase();
        const allowedAttrs = ALLOWED_ATTRS[tagName] || new Set();

        // Get all attributes and remove disallowed ones
        const attrs = el.attribs || {};
        for (const attr of Object.keys(attrs)) {
            if (!allowedAttrs.has(attr)) {
                $el.removeAttr(attr);
            }
        }
    });

    // Remove empty divs (but keep divs with only whitespace/br)
    $('div').each((_, el) => {
        const $el = $(el);
        const html = $el.html()?.trim() || '';
        if (!html || html === '<div></div>' || /^(<div>\s*<\/div>\s*)+$/.test(html)) {
            $el.remove();
        }
    });

    return $.html() || '';
};

/**
 * Process images: clean up lazy loading, use original URLs, remove duplicates
 */
export const processImages = (html: string): string => {
    const $ = load(html);

    const seenImages = new Set<string>();
    $('img').each((_, img) => {
        const $img = $(img);
        const $parent = $img.parent('a');

        // Get original image URL: parent href > data-src > src (remove /thumb/)
        let src = $parent.attr('href') || $img.attr('data-src') || $img.attr('src') || '';
        src = src.replace('/thumb/', '/');

        // Remove placeholder or duplicate images
        if (!src || src.startsWith('data:') || seenImages.has(src)) {
            $img.remove();
            return;
        }

        seenImages.add(src);
        $img.attr('src', src).removeAttr('data-src');

        // Unwrap from parent <a> tag
        if ($parent.length) {
            $parent.replaceWith($img);
        }
    });

    return $.html() || '';
};

/**
 * Process content: process images first, then sanitize HTML
 */
export const processContent = (html: string): string => {
    // Process images first (needs data-src attribute)
    const withImages = processImages(html);
    // Then sanitize HTML
    return sanitizeHtml(withImages);
};
