import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import type { JSX } from 'hono/jsx/jsx-runtime';

import ofetch from '@/utils/ofetch';

type BlockAttribute = 'bold' | 'italic';

type BlockModel = {
    blocks?: Block[];
    text?: string;
    timestamp?: number;
    listType?: string;
    listStyle?: string;
    locator?: string;
    originCode?: string;
    width?: number;
    height?: number;
    copyrightHolder?: string;
    attributes?: BlockAttribute[];
    imageUrl?: string;
    imageCopyright?: string;
    caption?: Block;
    image?: {
        alt?: string;
        copyright?: string;
        height?: number;
        width?: number;
        src?: string;
    };
    media?: {
        items?: Array<{
            holdingImageUrl?: string;
            title?: string;
        }>;
    };
    oembed?: {
        html: string;
    };
};

type Block = {
    type?: string;
    model?: BlockModel;
    blocks?: Block[];
    items?: Block[];
};

const applyAttributes = (content: JSX.Element | string, attributes?: BlockAttribute[]): JSX.Element | string => {
    let result: JSX.Element | string = content;
    for (const attribute of attributes ?? []) {
        switch (attribute) {
            case 'bold':
                result = <strong>{result}</strong>;
                break;

            case 'italic':
                result = <em>{result}</em>;
                break;

            default:
                throw new Error(`Unhandled attribute: ${attribute}`);
        }
    }
    return result;
};

const extractText = (blocks?: Block[]): string => {
    if (!blocks?.length) {
        return '';
    }

    return blocks
        .map((block) => {
            if (block.type === 'fragment') {
                return block.model?.text ?? '';
            }

            if (block.model?.text) {
                return block.model.text;
            }

            return extractText(block.model?.blocks ?? block.blocks ?? block.items);
        })
        .join('');
};

const renderInlineBlocks = (blocks?: Block[]): Array<JSX.Element | string> => {
    if (!blocks?.length) {
        return [];
    }

    return blocks.flatMap((block) => {
        if (block.type === 'fragment') {
            const text = block.model?.text ?? '';
            if (!text) {
                return [];
            }

            return [applyAttributes(text, block.model?.attributes)];
        }

        if (block.model?.blocks || block.blocks || block.items) {
            return renderInlineBlocks(block.model?.blocks ?? block.blocks ?? block.items);
        }

        if (block.model?.text) {
            return [block.model.text];
        }

        return [];
    });
};

const renderList = (block: Block, key: string): JSX.Element | null => {
    const items = block.model?.blocks ?? block.blocks ?? block.items;
    if (!items?.length) {
        return null;
    }

    const listItems = items.map((item, index) => {
        const content = renderInlineBlocks(item.model?.blocks ?? item.blocks ?? item.items);
        const fallback = item.model?.text ? [item.model.text] : [];
        return <li key={`${key}-item-${index}`}>{content.length ? content : fallback}</li>;
    });

    const listType = block.model?.listType ?? block.model?.listStyle ?? block.type;
    if (listType === 'ordered' || listType === 'orderedList') {
        return <ol key={key}>{listItems}</ol>;
    }

    return <ul key={key}>{listItems}</ul>;
};

const renderParagraph = (blocks?: Block[], keyPrefix = 'paragraph'): JSX.Element[] => {
    if (!blocks?.length) {
        return [];
    }

    return blocks.flatMap((block, index) => {
        const key = `${keyPrefix}-${index}`;
        switch (block.type) {
            case 'paragraph': {
                const content = renderInlineBlocks(block.model?.blocks ?? block.blocks ?? block.items);
                const fallbackText = block.model?.text;
                if (!content.length && !fallbackText) {
                    return [];
                }

                return [<p key={key}>{content.length ? content : fallbackText}</p>];
            }
            case 'subheading':
            case 'heading':
                return [<h2 key={key}>{extractText(block.model?.blocks ?? block.blocks ?? block.items)}</h2>];
            case 'list':
            case 'unorderedList':
            case 'orderedList': {
                const list = renderList(block, key);
                return list ? [list] : [];
            }
            default:
                return renderParagraph(block.model?.blocks ?? block.blocks ?? block.items, key);
        }
    });
};

const findBlocksByType = (blocks: Block[] | undefined, type: string): Block[] => {
    if (!blocks?.length) {
        return [];
    }

    const matches: Block[] = [];
    for (const block of blocks) {
        if (block.type === type) {
            matches.push(block);
        }

        matches.push(...findBlocksByType(block.model?.blocks ?? block.blocks ?? block.items, type));
    }

    return matches;
};

const buildImageUrl = (model?: BlockModel): string | undefined => {
    if (!model?.locator || !model.originCode) {
        return undefined;
    }

    return `https://ichef.bbci.co.uk/news/1536/${model.originCode}/${model.locator}`;
};

const renderFigure = (key: string, src: string, altText: string, width?: number, height?: number, caption?: string, copyrightHolder?: string): JSX.Element => (
    <figure key={key}>
        <img src={src} alt={altText} width={width} height={height} />
        {caption || copyrightHolder ? <figcaption>{[copyrightHolder, caption].filter(Boolean).join(' / ')}</figcaption> : null}
    </figure>
);

const renderImage = (block: Block, index: number): JSX.Element | null => {
    const imagePayload = block.model?.image;
    const captionPayload = block.model?.caption;
    if (imagePayload?.src) {
        const caption = extractText(captionPayload?.model?.blocks ?? captionPayload?.blocks ?? captionPayload?.items).trim();
        const altText = imagePayload.alt?.trim() ?? '';
        const copyrightHolder = imagePayload.copyright?.trim();

        return renderFigure(`image-${index}`, imagePayload.src, altText, imagePayload.width, imagePayload.height, caption, copyrightHolder);
    }

    const altTextBlock = findBlocksByType(block.model?.blocks ?? block.blocks ?? block.items, 'altText')[0];
    const captionBlock = findBlocksByType(block.model?.blocks ?? block.blocks ?? block.items, 'caption')[0];
    const rawImageBlock = findBlocksByType(block.model?.blocks ?? block.blocks ?? block.items, 'rawImage')[0];

    const altText = extractText(altTextBlock?.model?.blocks ?? altTextBlock?.blocks ?? altTextBlock?.items).trim();
    const caption = extractText(captionBlock?.model?.blocks ?? captionBlock?.blocks ?? captionBlock?.items).trim();
    const imageModel = rawImageBlock?.model ?? block.model;
    const src = buildImageUrl(imageModel);

    if (!src) {
        return null;
    }

    const copyrightHolder = imageModel?.copyrightHolder?.trim();

    return renderFigure(`image-${index}`, src, altText, imageModel?.width, imageModel?.height, caption, copyrightHolder);
};

const renderVideo = (block: Block, index: number): JSX.Element | null => {
    const altTextBlock = findBlocksByType(block.model?.blocks ?? block.blocks ?? block.items, 'altText')[0];
    const captionBlock = findBlocksByType(block.model?.blocks ?? block.blocks ?? block.items, 'caption')[0];
    const mediaMetadataBlock = findBlocksByType(block.model?.blocks ?? block.blocks ?? block.items, 'mediaMetadata')[0];
    const aresMediaBlock = findBlocksByType(block.model?.blocks ?? block.blocks ?? block.items, 'aresMedia')[0];
    const aresMediaMetadata = aresMediaBlock ? (aresMediaBlock.model?.blocks ?? aresMediaBlock.blocks ?? aresMediaBlock.items)?.[0] : undefined;

    const altText = extractText(altTextBlock?.model?.blocks ?? altTextBlock?.blocks ?? altTextBlock?.items).trim();
    const caption = extractText(captionBlock?.model?.blocks ?? captionBlock?.blocks ?? captionBlock?.items).trim();

    let src: string | undefined;
    let sourceText: string | undefined;

    if (mediaMetadataBlock?.model?.imageUrl) {
        src = mediaMetadataBlock.model.imageUrl;
        sourceText = mediaMetadataBlock.model.imageCopyright;
    } else if (aresMediaMetadata?.model?.imageUrl) {
        src = `https://${aresMediaMetadata.model.imageUrl.replace('/$recipe/', '/800xn/')}`;
        sourceText = aresMediaMetadata.model.imageCopyright;
    }

    if (!src) {
        return null;
    }

    return renderFigure(`video-${index}`, src, altText, undefined, undefined, caption, sourceText);
};

const renderMedia = (block: Block, index: number): JSX.Element | null => {
    const mediaItem = block.model?.media?.items?.[0];
    const holdingImageUrl = mediaItem?.holdingImageUrl;

    if (!holdingImageUrl) {
        return null;
    }

    const caption = extractText(block.model?.caption?.model?.blocks ?? block.model?.caption?.blocks ?? block.model?.caption?.items).trim();
    const altText = mediaItem?.title?.trim() ?? '';

    return renderFigure(`media-${index}`, holdingImageUrl.replace('/$recipe/', '/800xn/'), altText, undefined, undefined, caption);
};

const renderOEmbed = (block: Block, index: number, keyPrefix = 'oembed'): JSX.Element | null => {
    const aresOEmbedBlock = findBlocksByType(block.model?.blocks ?? block.blocks ?? block.items, 'aresOEmbed')[0];
    const oembedHtml = aresOEmbedBlock?.model?.oembed?.html ?? block.model?.oembed?.html;

    if (!oembedHtml) {
        return null;
    }

    return <div key={`${keyPrefix}-${index}`}>{raw(oembedHtml)}</div>;
};

const renderEmbedImages = (block: Block, index: number): JSX.Element | null => {
    const imageBlocks = findBlocksByType(block.model?.blocks ?? block.blocks ?? block.items, 'image');

    if (!imageBlocks?.length) {
        return null;
    }

    let largestImage: Block | null = null;
    let maxWidth = 0;

    for (const imageBlock of imageBlocks) {
        const rawImageBlock = findBlocksByType(imageBlock.model?.blocks ?? imageBlock.blocks ?? imageBlock.items, 'rawImage')[0];
        const width = rawImageBlock?.model?.width;

        if (width && width > maxWidth) {
            maxWidth = width;
            largestImage = imageBlock;
        }
    }

    if (!largestImage) {
        return null;
    }

    return renderImage(largestImage, index);
};

const renderBlock = (block: Block, index: number): JSX.Element | JSX.Element[] | null => {
    switch (block.type) {
        case 'image':
            return renderImage(block, index);
        case 'video':
            return renderVideo(block, index);
        case 'text':
            return renderParagraph(block.model?.blocks ?? block.blocks ?? block.items, `text-${index}`);
        case 'media':
            return renderMedia(block, index);
        case 'subheadline': {
            const text = extractText(block.model?.blocks ?? block.blocks ?? block.items).trim();
            return text ? <h2 key={`subheadline-${index}`}>{text}</h2> : null;
        }
        case 'social':
            return renderOEmbed(block, index, 'social');
        case 'oEmbed':
            return renderOEmbed(block, index);
        case 'embedImages':
            return renderEmbedImages(block, index);
        case 'headline':
        case 'timestamp':
        case 'byline':
        case 'advertisement':
        case 'embed': // #region /zhongwen/topics
        case 'disclaimer':
        case 'continueReading':
        case 'mpu':
        case 'wsoj':
        case 'relatedContent':
        case 'links':
        case 'visuallyHiddenHeadline':
        case 'fauxHeadline': // #endregion
        case 'metadata': // #region /sports
        case 'topicList':
        case 'promoList': // #endregion
            return null;
        default:
            return renderParagraph(block.model?.blocks ?? block.blocks ?? block.items, `block-${index}`);
    }
};

const renderArticleContent = (content: Block[]): string => renderToString(<>{content.flatMap((block, index) => renderBlock(block, index)).filter((node) => node !== null)}</>);

export const extractInitialData = ($: CheerioAPI): any => {
    const initialDataText = JSON.parse(
        $('script:contains("window.__INITIAL_DATA__")')
            .text()
            .match(/window\.__INITIAL_DATA__\s*=\s*(.*);/)?.[1] ?? '{}'
    );

    return JSON.parse(initialDataText);
};

const extractArticleWithInitialData = ($: CheerioAPI, item) => {
    if (item.link.includes('/live/') || item.link.includes('/videos/') || item.link.includes('/extra/')) {
        return {
            description: item.content,
        };
    }

    const initialData = extractInitialData($);
    const article = Object.values(initialData.data).find((d) => d.name === 'article')?.data;
    const topics = Array.isArray(article?.topics) ? article.topics : [];
    const blocks = article?.content?.model?.blocks;

    return {
        category: [...new Set([...(item.category || []), ...topics.map((t) => t.title)])],
        description: blocks ? renderArticleContent(blocks) : item.content,
    };
};

export const fetchBbcContent = async (link: string, item) => {
    const response = await ofetch.raw(link, {
        retryStatusCodes: [403],
    });
    const $ = load(response._data);
    const { hostname, pathname } = new URL(response.url);

    switch (true) {
        case hostname === 'www.bbc.co.uk':
        case pathname.startsWith('/sport'):
            return extractArticleWithInitialData($, item);
        case pathname.startsWith('/sounds/play') || pathname.startsWith('/news/live'):
            return {
                description: item.content ?? item.description ?? '',
            };
        case pathname.startsWith('/zhongwen/articles/'): {
            const nextData = JSON.parse($('script#__NEXT_DATA__').text());
            const pageData = nextData.props.pageProps.pageData;
            const metadata = pageData.metadata;
            const aboutLabels = metadata.tags?.about?.map((t) => t.thingLabel) ?? [];
            const topicNames = metadata.topics?.map((t) => t.topicName) ?? [];

            return {
                category: [...new Set([...aboutLabels, ...topicNames])],
                description: renderArticleContent(pageData.content.model.blocks),
            };
        }
        case pathname.startsWith('/news/'): {
            const nextData = JSON.parse($('script#__NEXT_DATA__').text());
            const pageProps = nextData.props.pageProps;
            const articleData = pageProps.page[pageProps.pageKey];

            return {
                category: [...new Set([...(item.category || []), ...(articleData.topics?.map((t) => t.title) ?? [])])],
                description: renderArticleContent(articleData.contents),
            };
        }
        default:
            break;
    }

    const nextData = JSON.parse($('script#__NEXT_DATA__').text());
    const pageProps = nextData.props.pageProps;
    const articleData = pageProps.page[pageProps.pageKey];

    return {
        description: renderArticleContent(articleData.contents),
    };
};
