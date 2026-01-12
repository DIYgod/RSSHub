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
    atomic: { element: undefined },
    'code-block': { element: 'pre' },
    unstyled: { element: 'p' },
};

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
            return entity.data.content.startsWith('http') ? `<a href="${entity.data.content}" target="_blank">${entity.data.content}</a>` : entity.data.content;
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
            return `<a href="${entity.data.url}" target="_blank">${text}</a>`;
        case 'WIDGET':
            return `<a href="${entity.data.url}" target="_blank">${entity.data.title}</a>`;
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
    const blockType = BLOCK_TYPES[block.type];
    if (!blockType) {
        return '';
    }

    const { text, inlineStyleRanges, entityRanges } = block;

    // Combine and sort ranges
    const combinedRanges: Array<{
        offset: number;
        length: number;
        styles: Style[];
        entity: Entity | null;
    }> = [];

    for (const range of inlineStyleRanges) {
        combinedRanges.push({
            ...range,
            styles: [STYLES[range.style]],
            entity: null,
        });
    }

    for (const range of entityRanges) {
        combinedRanges.push({
            ...range,
            styles: [],
            entity: entityMap[range.key],
        });
    }

    combinedRanges.sort((a, b) => a.offset - b.offset);

    // Group ranges by offset and length
    const groupedRangesMap = new Map<string, { offset: number; length: number; styles: Style[]; entities: Entity[] }>();
    const groupedRanges: Array<{ offset: number; length: number; styles: Style[]; entities: Entity[] }> = [];

    for (const range of combinedRanges) {
        const rangeKey = `${range.offset}-${range.length}`;
        let existingRange = groupedRangesMap.get(rangeKey);
        if (!existingRange) {
            existingRange = {
                offset: range.offset,
                length: range.length,
                styles: [],
                entities: [],
            };
            groupedRangesMap.set(rangeKey, existingRange);
            groupedRanges.push(existingRange);
        }

        if (range.styles.length > 0) {
            existingRange.styles.push(...range.styles);
        }
        if (range.entity) {
            existingRange.entities.push(range.entity);
        }
    }

    // Apply styles and entities
    const resultParts: string[] = [];
    let lastOffset = 0;

    for (const range of groupedRanges) {
        resultParts.push(text.substring(lastOffset, range.offset));

        let styledText = text.substring(range.offset, range.offset + range.length);

        if (range.styles.length > 0) {
            const combinedStyle: Style = {};
            for (const style of range.styles) {
                for (const [key, value] of Object.entries(style)) {
                    combinedStyle[key] = value;
                }
            }
            styledText = createStyledFragment(styledText, combinedStyle);
        }

        if (range.entities.length > 0) {
            for (const entity of range.entities) {
                styledText = createEntityElement(entity, styledText);
            }
        }

        resultParts.push(styledText);
        lastOffset = range.offset + range.length;
    }

    resultParts.push(text.slice(lastOffset));

    return `${blockType.element ? `<${blockType.element}>` : ''}${resultParts.join('').replaceAll('\n', '<br>')}${blockType.element ? `</${blockType.element}>` : ''}`;
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
    let currentParent: string | undefined = undefined;
    let parentContent: string[] = [];

    for (const block of blocks) {
        const blockType = BLOCK_TYPES[block.type];
        if (!blockType) {
            continue;
        }

        const parsedBlock = parseBlock(block, entityMap);

        if (blockType.parentElement) {
            if (currentParent === blockType.parentElement) {
                parentContent.push(parsedBlock);
            } else {
                if (currentParent) {
                    htmlParts.push(`<${currentParent}>${parentContent.join('')}</${currentParent}>`);
                }
                currentParent = blockType.parentElement;
                parentContent = [parsedBlock];
            }
        } else {
            if (currentParent) {
                htmlParts.push(`<${currentParent}>${parentContent.join('')}</${currentParent}>`);
                currentParent = undefined;
                parentContent = [];
            }
            htmlParts.push(parsedBlock);
        }
    }

    if (currentParent) {
        htmlParts.push(`<${currentParent}>${parentContent.join('')}</${currentParent}>`);
    }

    return htmlParts.join('');
};

export { parseContent };
