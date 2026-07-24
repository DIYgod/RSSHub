import { load } from 'cheerio';
import { encodeXML } from 'entities';

export interface BilibiliOpusImage {
    url: string;
    width?: number;
    height?: number;
}

interface BilibiliOpusParagraph {
    para_type?: number;
    text?: {
        nodes?: BilibiliOpusTextNode[];
    };
    pic?: {
        pics?: BilibiliOpusImage[];
    };
    line?: {
        pic?: BilibiliOpusImage;
    };
    list?: {
        style?: number;
        items?: Array<{
            order?: number;
            nodes?: BilibiliOpusTextNode[];
        }>;
    };
    heading?: {
        level?: number;
        nodes?: BilibiliOpusTextNode[];
    };
    blockquote?: {
        nodes?: BilibiliOpusTextNode[];
    };
    code?: {
        content?: string;
        lang?: string;
    };
}

interface BilibiliOpusTextNode {
    word?: {
        words?: string;
        jump_url?: string;
    };
    rich?: {
        text?: string;
        jump_url?: string;
    };
    formula?: {
        latex_content?: string;
    };
    user?: {
        name?: string;
        jump_url?: string;
    };
}

interface BilibiliOpusModule {
    module_type?: string;
    module_title?: {
        text?: string;
    };
    module_author?: {
        name?: string;
        pub_ts?: number;
    };
    module_content?: {
        paragraphs?: BilibiliOpusParagraph[];
    };
}

interface BilibiliOpusItem {
    id_str?: string;
    modules?: BilibiliOpusModule[];
}

interface BilibiliOpusDetailResponse {
    code?: number;
    data?: {
        item?: BilibiliOpusItem;
    };
}

export const normalizeBilibiliImageUrl = (url: string) => {
    if (url.startsWith('//')) {
        return `https:${url}`;
    }
    if (url.startsWith('http://')) {
        return `https://${url.slice('http://'.length)}`;
    }
    return url;
};

const normalizeBilibiliImages = (images: BilibiliOpusImage[]) => {
    const seen = new Set<string>();

    return images.flatMap((image) => {
        if (!image.url) {
            return [];
        }
        const url = normalizeBilibiliImageUrl(image.url);
        if (seen.has(url)) {
            return [];
        }
        seen.add(url);
        return [
            {
                url,
                width: image.width,
                height: image.height,
            },
        ];
    });
};

const extractBilibiliOpusItemImages = (item?: BilibiliOpusItem) => {
    const images =
        item?.modules
            ?.filter((module) => module.module_type === 'MODULE_TYPE_CONTENT')
            .flatMap((module) => (module.module_content?.paragraphs ?? []).flatMap((paragraph) => [...(paragraph.pic?.pics ?? []), ...(paragraph.line?.pic ? [paragraph.line.pic] : [])])) ?? [];

    return normalizeBilibiliImages(images);
};

export const extractBilibiliOpusImages = (response: BilibiliOpusDetailResponse): BilibiliOpusImage[] => extractBilibiliOpusItemImages(response.data?.item);

const renderBilibiliOpusTextNodes = (nodes: BilibiliOpusTextNode[] = []) =>
    nodes
        .map((node) => {
            const text = node.word?.words || node.rich?.text || node.user?.name || node.formula?.latex_content;
            if (!text) {
                return '';
            }

            const content = encodeXML(text).replaceAll('\n', '<br>');
            const url = node.word?.jump_url || node.rich?.jump_url || node.user?.jump_url;
            return url ? `<a href="${encodeXML(normalizeBilibiliImageUrl(url))}">${content}</a>` : content;
        })
        .join('');

const renderBilibiliOpusParagraph = (paragraph: BilibiliOpusParagraph) => {
    if (paragraph.pic?.pics?.length) {
        return `<figure>${renderBilibiliImages(paragraph.pic.pics)}</figure>`;
    }
    if (paragraph.line?.pic) {
        return `<figure>${renderBilibiliImages([paragraph.line.pic])}</figure>`;
    }
    if (paragraph.list?.items?.length) {
        const tag = paragraph.list.items.some((item) => item.order !== undefined) ? 'ol' : 'ul';
        const items = paragraph.list.items.map((item) => `<li>${renderBilibiliOpusTextNodes(item.nodes)}</li>`).join('');
        return `<${tag}>${items}</${tag}>`;
    }
    if (paragraph.heading?.nodes?.length) {
        const level = Math.min(Math.max(paragraph.heading.level || 2, 1), 6);
        return `<h${level}>${renderBilibiliOpusTextNodes(paragraph.heading.nodes)}</h${level}>`;
    }
    if (paragraph.blockquote?.nodes?.length) {
        return `<blockquote>${renderBilibiliOpusTextNodes(paragraph.blockquote.nodes)}</blockquote>`;
    }
    if (paragraph.code?.content) {
        const language = paragraph.code.lang ? ` class="language-${encodeXML(paragraph.code.lang)}"` : '';
        return `<pre><code${language}>${encodeXML(paragraph.code.content)}</code></pre>`;
    }

    const text = renderBilibiliOpusTextNodes(paragraph.text?.nodes);
    return text ? `<p>${text}</p>` : '';
};

export const parseBilibiliOpusArticle = (response: BilibiliOpusDetailResponse) => {
    if (response.code !== undefined && response.code !== 0) {
        return {};
    }

    const modules = response.data?.item?.modules ?? [];
    const title = modules.find((module) => module.module_type === 'MODULE_TYPE_TITLE')?.module_title?.text;
    const author = modules.find((module) => module.module_type === 'MODULE_TYPE_AUTHOR')?.module_author;
    const description = modules
        .filter((module) => module.module_type === 'MODULE_TYPE_CONTENT')
        .flatMap((module) => module.module_content?.paragraphs ?? [])
        .map((paragraph) => renderBilibiliOpusParagraph(paragraph))
        .filter(Boolean)
        .join('');

    return {
        title: title || undefined,
        description: description || undefined,
        author: author?.name || undefined,
        pubDate: author?.pub_ts,
    };
};

export const extractBilibiliOpusImagesFromHtml = (data: string): BilibiliOpusImage[] => {
    const $ = load(data);
    const script = $('script:contains("window.__INITIAL_STATE__")').first().html();
    const initialState = script?.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\})\s*;\s*\(function\(/s)?.[1];

    if (initialState) {
        try {
            const state = JSON.parse(initialState) as {
                detail?: BilibiliOpusItem;
            };
            const images = extractBilibiliOpusItemImages(state.detail);
            if (images.length) {
                return images;
            }
        } catch {
            // Fall back to the server-rendered images below.
        }
    }

    return normalizeBilibiliImages(
        $('.opus-module-content img')
            .toArray()
            .flatMap((element) => {
                const image = $(element);
                const url = image.attr('src');
                if (!url) {
                    return [];
                }
                const width = Math.trunc(Number(image.attr('width') || '')) || undefined;
                const height = Math.trunc(Number(image.attr('height') || '')) || undefined;
                return [{ url, width, height }];
            })
    );
};

export const renderBilibiliImages = (images: BilibiliOpusImage[]) =>
    images
        .filter((image) => image.url)
        .map((image) => {
            const attributes = [`src="${encodeXML(normalizeBilibiliImageUrl(image.url))}"`, image.width ? `width="${image.width}"` : '', image.height ? `height="${image.height}"` : ''].filter(Boolean);

            return `<img ${attributes.join(' ')}>`;
        })
        .join('');
