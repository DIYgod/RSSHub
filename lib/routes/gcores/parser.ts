import { escapeAttribute, escapeText } from 'entities';

import { renderDescription } from './templates/description';

interface Style {
    [key: string]: string;
}

interface BlockType {
    element: string | undefined;
    parentElement?: string;
    aliasedElements?: string[];
}

interface InlineStyleRange {
    offset: number;
    length: number;
    style: string;
}

interface EntityRange {
    offset: number;
    length: number;
    key: number;
}

interface Entity {
    type: string;
    mutability: string;
    data: any;
}

interface Block {
    key: string;
    text: string;
    type: string;
    depth: number;
    inlineStyleRanges: InlineStyleRange[];
    entityRanges: EntityRange[];
    data: any;
}

interface Content {
    blocks: Block[];
    entityMap: { [key: string]: Entity };
}

const imageBaseUrl = 'https://image.gcores.com';

const STYLES = new Map<string, Style>([
    ['BOLD', { fontWeight: 'bold' }],
    ['CODE', { fontFamily: 'monospace', wordWrap: 'break-word' }],
    ['ITALIC', { fontStyle: 'italic' }],
    ['STRIKETHROUGH', { textDecoration: 'line-through' }],
    ['UNDERLINE', { textDecoration: 'underline' }],
]);

const BLOCK_TYPES = new Map<string, BlockType>([
    ['header-one', { element: 'h1' }],
    ['header-two', { element: 'h2' }],
    ['header-three', { element: 'h3' }],
    ['header-four', { element: 'h4' }],
    ['header-five', { element: 'h5' }],
    ['header-six', { element: 'h6' }],
    ['unordered-list-item', { element: 'li', parentElement: 'ul' }],
    ['ordered-list-item', { element: 'li', parentElement: 'ol' }],
    ['blockquote', { element: 'blockquote' }],
    ['atomic', { element: undefined }],
    ['code-block', { element: 'pre' }],
    ['unstyled', { element: 'p' }],
]);

/**
 * Creates a styled HTML fragment for a given text and style object.
 * @param text - The text content.
 * @param style - CSS styles as key-value pairs.
 * @returns HTML string with applied styles.
 */
const createStyledFragment = (text: string, style: Readonly<Style>): string => {
    const styleString = Object.entries(style)
        .map(([key, value]) => `${key.replaceAll(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
        .join('; ');
    return `<span style="${styleString}">${text}</span>`;
};

/**
 * Creates an HTML element for a given entity.
 * @param entity - The entity to create an element for.
 * @param text - The text content of the entity.
 * @returns HTML element string.
 */
const createEntityElement = (entity: Entity, text: string): string => {
    switch (entity.type) {
        case 'EMBED':
            return entity.data.content.startsWith('http') ? `<a href="${escapeAttribute(entity.data.content)}" target="_blank">${escapeText(entity.data.content)}</a>` : entity.data.content;
        case 'IMAGE':
            return renderDescription({
                images: entity.data.path
                    ? [
                          {
                              src: new URL(entity.data.path, imageBaseUrl).href,
                              alt: entity.data.caption,
                              width: entity.data.width,
                              height: entity.data.height,
                          },
                      ]
                    : undefined,
            }).replaceAll('\n', '');
        case 'GALLERY':
            if (!entity.data.images || !Array.isArray(entity.data.images)) {
                return '';
            }
            return renderDescription({
                images: entity.data.images.map((image: any) => ({
                    src: new URL(image.path, imageBaseUrl).href,
                    alt: image.caption ?? entity.data.caption,
                    width: image.width,
                    height: image.height,
                })),
            }).replaceAll('\n', '');
        case 'LINK':
            return `<a href="${escapeAttribute(entity.data.url)}" target="_blank">${text}</a>`;
        case 'WIDGET':
            return `<a href="${escapeAttribute(entity.data.url)}" target="_blank">${escapeText(entity.data.title)}</a>`;
        default:
            return '';
    }
};

/**
 * Parses a block into an HTML string with applied styles and entities.
 * @param block - The block to parse.
 * @param entityMap - The entity map.
 * @returns HTML string representing the block.
 */
const parseBlock = (block: Block, entityMap: Readonly<Record<string, Entity>>): string => {
    const blockType = BLOCK_TYPES.get(block.type);
    if (!blockType) {
        return '';
    }

    const { text, inlineStyleRanges, entityRanges } = block;

    const styleRanges = inlineStyleRanges.map((range) => ({
        start: Math.max(0, Math.min(text.length, range.offset)),
        end: Math.max(0, Math.min(text.length, range.offset + range.length)),
        style: STYLES.get(range.style),
    }));
    const mappedEntityRanges = entityRanges.map((range) => ({
        start: Math.max(0, Math.min(text.length, range.offset)),
        end: Math.max(0, Math.min(text.length, range.offset + range.length)),
        entity: entityMap[range.key],
    }));
    const boundaries = [...new Set([0, text.length, ...styleRanges.flatMap((range) => [range.start, range.end]), ...mappedEntityRanges.flatMap((range) => [range.start, range.end])])].sort((a, b) => a - b);
    const resultParts: string[] = [];

    for (const [index, start] of boundaries.entries()) {
        // Non-text entities replace their entire range and must only be rendered once.
        for (const range of mappedEntityRanges) {
            if (range.start === start && range.entity && (range.entity.type !== 'LINK' || range.start === range.end)) {
                resultParts.push(createEntityElement(range.entity, ''));
            }
        }

        const end = boundaries[index + 1];
        if (end === undefined || mappedEntityRanges.some((range) => range.entity && range.entity.type !== 'LINK' && range.start <= start && range.end >= end)) {
            continue;
        }

        let styledText = escapeText(text.slice(start, end));
        const styles = styleRanges.filter((range) => range.style && range.start <= start && range.end >= end);
        if (styles.length > 0) {
            const combinedStyle: Style = {};
            for (const range of styles) {
                Object.assign(combinedStyle, range.style);
            }
            styledText = createStyledFragment(styledText, combinedStyle);
        }

        for (const range of mappedEntityRanges) {
            if (range.entity?.type === 'LINK' && range.start <= start && range.end >= end) {
                styledText = createEntityElement(range.entity, styledText);
            }
        }
        resultParts.push(styledText);
    }

    return `${blockType.element ? `<${blockType.element}>` : ''}${resultParts.join('').replaceAll('\n', '<br>')}${blockType.element ? `</${blockType.element}>` : ''}`;
};

const parseListBlocks = (blocks: Block[], entityMap: Readonly<Record<string, Entity>>): string => {
    const parts: string[] = [];
    const parents: Array<{ element: string; depth: number }> = [];

    for (const block of blocks) {
        const parent = BLOCK_TYPES.get(block.type)?.parentElement;
        if (!parent) {
            continue;
        }
        const depth = Math.max(0, block.depth ?? 0);

        while (parents.length > 0 && parents.at(-1)!.depth > depth) {
            parts.push(`</li></${parents.pop()!.element}>`);
        }
        if (parents.at(-1)?.depth === depth) {
            parts.push('</li>');
            if (parents.at(-1)?.element !== parent) {
                parts.push(`</${parents.pop()!.element}><${parent}>`);
                parents.push({ element: parent, depth });
            }
        } else {
            parts.push(`<${parent}>`);
            parents.push({ element: parent, depth });
        }
        // Keep the item open so its child list remains inside the parent item.
        parts.push(parseBlock(block, entityMap).slice(0, -'</li>'.length));
    }
    while (parents.length > 0) {
        parts.push(`</li></${parents.pop()!.element}>`);
    }
    return parts.join('');
};

/**
 * Parses a Content object into an HTML string.
 * @param content - The Content object to parse.
 * @returns HTML string representing the content.
 */
const parseContent = (content: Content): string => {
    const { blocks, entityMap } = content;

    if (!blocks || blocks.length === 0) {
        return '';
    }

    const htmlParts: string[] = [];
    let listBlocks: Block[] = [];

    for (const block of blocks) {
        const blockType = BLOCK_TYPES.get(block.type);
        if (!blockType) {
            continue;
        }

        if (blockType.parentElement) {
            listBlocks.push(block);
        } else {
            if (listBlocks.length > 0) {
                htmlParts.push(parseListBlocks(listBlocks, entityMap));
                listBlocks = [];
            }
            htmlParts.push(parseBlock(block, entityMap));
        }
    }

    if (listBlocks.length > 0) {
        htmlParts.push(parseListBlocks(listBlocks, entityMap));
    }

    return htmlParts.join('');
};

export { parseContent };
