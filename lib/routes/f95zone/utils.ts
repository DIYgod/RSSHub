import { load } from 'cheerio';

const ALLOWED_TAGS = new Set(['div', 'span', 'p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'a', 'img', 'ul', 'ol', 'li', 'blockquote', 'hr', 'pre', 'code']);
const ALLOWED_ATTRS: Record<string, string[]> = {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'style'],
    div: ['style'],
    span: ['style'],
};

export const processContent = (html: string): string => {
    const $ = load(html);

    // Process images: use original URLs, remove duplicates
    const seenImages = new Set<string>();
    $('img').each((_, el) => {
        const $img = $(el);
        const $parent = $img.parent('a');
        let src = $parent.attr('href') || $img.attr('data-src') || $img.attr('src') || '';
        src = src.replace('/thumb/', '/');

        if (!src || src.startsWith('data:') || seenImages.has(src)) {
            $img.remove();
        } else {
            seenImages.add(src);
            $img.attr('src', src).removeAttr('data-src');
            if ($parent.length) {
                $parent.replaceWith($img);
            }
        }
    });

    // Remove unwanted tags completely
    $('button, script, style, noscript').remove();

    // Remove disallowed tags but keep content
    let changed = true;
    while (changed) {
        changed = false;
        $('*').each((_, el) => {
            if (el.type === 'tag' && !ALLOWED_TAGS.has(el.name)) {
                $(el).replaceWith($(el).html() || '');
                changed = true;
                return false;
            }
        });
    }

    // Clean attributes
    $('*').each((_, el) => {
        if (el.type !== 'tag') {
            return;
        }
        const allowed = new Set(ALLOWED_ATTRS[el.name] || []);
        for (const attr of Object.keys(el.attribs || {})) {
            if (!allowed.has(attr)) {
                $(el).removeAttr(attr);
            }
        }
    });

    // Remove empty divs
    $('div')
        .filter((_, el) => !$(el).html()?.trim())
        .remove();

    return $.html() || '';
};
