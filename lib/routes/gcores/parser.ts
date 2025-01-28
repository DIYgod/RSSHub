import { art } from '@/utils/render';
import { getCurrentPath } from '@/utils/helpers';

import path from 'node:path';

export const __dirname = getCurrentPath(import.meta.url);

interface Style {
    [key: string]: string;
}

interface BlockType {
    element: string;
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

const imageBaseUrl: string = 'https://image.gcores.com';

const STYLES: Readonly<Record<string, Style>> = {
    BOLD: { fontWeight: 'bold' },
    CODE: { fontFamily: 'monospace', wordWrap: 'break-word' },
    ITALIC: { fontStyle: 'italic' },
    STRIKETHROUGH: { textDecoration: 'line-through' },
    UNDERLINE: { textDecoration: 'underline' },
};

const BLOCK_TYPES: Readonly<Record<string, BlockType>> = {
    'header-one': { element: 'h1' },
    'header-two': { element: 'h2' },
    'header-three': { element: 'h3' },
    'header-four': { element: 'h4' },
    'header-five': { element: 'h5' },
    'header-six': { element: 'h6' },
    'unordered-list-item': { element: 'li', parentElement: 'ul' },
    'ordered-list-item': { element: 'li', parentElement: 'ol' },
    blockquote: { element: 'blockquote' },
    atomic: { element: 'figure' },
    'code-block': { element: 'pre' },
    unstyled: { element: 'div', aliasedElements: ['p'] },
};

/**
 * Creates a styled HTML fragment for a given text and style object.
 * @param text The text content of the fragment.
 * @param style An object containing CSS styles (key-value pairs).
 * @returns An HTML string representing the styled fragment.
 */
const createStyledFragment = (text: string, style: Record<string, string>): string =>
    `<span style="${Object.entries(style)
        .map(([key, value]) => `${key}: ${value};`)
        .join('')}">${text}</span>`;

/**
 * Applies inline styles to a text string.
 * @param text The text to style.
 * @param inlineStyleRanges An array of inline style ranges.
 * @returns The styled text.
 */
const applyStyles = (text: string, inlineStyleRanges: readonly InlineStyleRange[]): string => {
    if (!inlineStyleRanges || inlineStyleRanges.length === 0) {
        return text;
    }

    const sortedRanges = [...inlineStyleRanges].sort((a, b) => a.offset - b.offset);

    let lastOffset = 0;
    const styledFragments = sortedRanges.map((range) => {
        const style = STYLES[range.style];
        if (!style) {
            return text.substring(lastOffset, range.offset);
        }

        const styledText = createStyledFragment(text.substring(range.offset, range.offset + range.length), style);
        const preText = text.substring(lastOffset, range.offset);
        lastOffset = range.offset + range.length;
        return preText + styledText;
    });
    let result = styledFragments.join('');
    result += text.substring(lastOffset);
    return result;
};

/**
 * Creates an HTML element for a given entity.
 * @param entity The entity to create an element for.
 * @param block The current block the entity belongs to, for debugging purposes.
 * @returns The HTML element string.
 */
const createEntityElement = (entity: Entity, block: Block): string => {
    switch (entity.type) {
        case 'EMBED':
            return entity.data.content.startsWith('http') ? `<a href="${entity.data.content}" target="_blank">${entity.data.content}</a>` : entity.data.content;
        case 'IMAGE':
            return art(path.join(__dirname, 'templates/description.art'), {
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
            });
        case 'GALLERY':
            if (!entity.data.images || !Array.isArray(entity.data.images)) {
                return '';
            }
            return art(path.join(__dirname, 'templates/description.art'), {
                images: entity.data.images.map((image: any) => ({
                    src: new URL(image.path, imageBaseUrl).href,
                    alt: image.caption,
                    width: image.width,
                    height: image.height,
                })),
            });
        case 'LINK':
            return `<a href="${entity.data.href}" target="_blank">${block.text}</a>`;
        case 'WIDGET':
            return `<a href="${entity.data.url}" target="_blank">${entity.data.title}</a>`;
        default:
            return '';
    }
};

/**
 * Parses a single content block into an HTML string.
 * @param block The block to parse.
 * @param entityMap The entity map.
 * @returns The parsed HTML string.
 */
const parseBlock = (block: Block, entityMap: { [key: string]: Entity }): string => {
    const blockType = BLOCK_TYPES[block.type];
    if (!blockType) {
        return '';
    }

    const usedElement = blockType.aliasedElements?.[0] ?? blockType.element;

    let content = applyStyles(block.text, block.inlineStyleRanges);

    if (block.entityRanges && block.entityRanges.length > 0) {
        const entityElements = block.entityRanges
            .map((range) => entityMap[range.key])
            .filter(Boolean)
            .map((entity) => createEntityElement(entity!, block));

        content = entityElements.join('');
    }

    return `<${usedElement}>${content}</${usedElement}>`;
};

/**
 * Parses a Content object into an HTML string using a for loop.
 * @param content The Content object to parse.
 * @returns The parsed HTML string.
 */
const parseContent = (content: Content): string => {
    const { blocks, entityMap } = content;

    if (!blocks || blocks.length === 0) {
        return '';
    }

    let html = '';
    let currentParent: string | undefined = undefined;
    let parentContent = '';

    for (const block of blocks) {
        const blockType = BLOCK_TYPES[block.type];
        if (!blockType) {
            continue;
        }

        const parentElement = blockType.parentElement;
        const parsedBlock = parseBlock(block, entityMap);

        if (parentElement) {
            if (currentParent === parentElement) {
                parentContent += parsedBlock;
            } else {
                if (currentParent) {
                    html += `<${currentParent}>${parentContent}</${currentParent}>`;
                }
                currentParent = parentElement;
                parentContent = parsedBlock;
            }
        } else {
            if (currentParent) {
                html += `<${currentParent}>${parentContent}</${currentParent}>`;
                currentParent = undefined;
                parentContent = '';
            }
            html += parsedBlock;
        }
    }

    if (currentParent) {
        html += `<${currentParent}>${parentContent}</${currentParent}>`;
    }

    return html;
};

export { parseContent };
