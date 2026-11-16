import { load } from 'cheerio';
import { raw } from 'hono/html';
import type { Child } from 'hono/jsx';
import { renderToString } from 'hono/jsx/dom/server';

import { type ArticleBlock, type ArticleBlockContent, type ArticleDetail, type ArticleListItem, extractPlainText, isHostnameOrSubdomain, pickImageUrl, resolveHttpUrl, resolveSafeUrl, sanitizeRichHtml } from '../utils';

const DIRECT_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v'];

const YOUTUBE_DOMAINS = ['youtube.com', 'youtube-nocookie.com'];

const extractYouTubeId = (parsed: URL): string | undefined => {
    if (parsed.hostname === 'youtu.be') {
        const shortId = parsed.pathname.slice(1).split('/', 1)[0];
        return shortId && /^[\w-]{11}$/.test(shortId) ? shortId : undefined;
    }
    if (YOUTUBE_DOMAINS.some((domain) => isHostnameOrSubdomain(parsed.hostname, domain))) {
        const vParam = parsed.searchParams.get('v');
        if (vParam && /^[\w-]{11}$/.test(vParam)) {
            return vParam;
        }
        const segments = parsed.pathname.split('/').filter(Boolean);
        const markerIndex = segments.findIndex((seg) => ['embed', 'shorts', 'live'].includes(seg));
        const pathId = markerIndex === -1 ? undefined : segments[markerIndex + 1];
        return pathId && /^[\w-]{11}$/.test(pathId) ? pathId : undefined;
    }
    return undefined;
};

const renderHtmlFragment = (html?: string): Child => {
    const cleanHtml = sanitizeRichHtml(html);
    return cleanHtml ? raw(cleanHtml) : null;
};

const renderImageBlock = (content: ArticleBlockContent): Child => {
    const src = pickImageUrl(content.image);
    if (!src) {
        return null;
    }
    const captionText = content.text?.trim();
    const extraDescription = sanitizeRichHtml(content.description);
    const linkUrl = content.isLink ? resolveSafeUrl(content.url) : undefined;
    const captionNode = linkUrl ? <a href={linkUrl}>{captionText || linkUrl}</a> : captionText;

    return (
        <figure>
            <img src={src} alt={captionText ?? ''} />
            {captionNode || extraDescription ? (
                <figcaption>
                    {captionNode ? <p>{captionNode}</p> : null}
                    {extraDescription ? raw(extraDescription) : null}
                </figcaption>
            ) : null}
        </figure>
    );
};

const renderImageLinkBlock = (content: ArticleBlockContent): Child => {
    const src = pickImageUrl(content.image);
    if (!src) {
        return null;
    }
    const captionText = content.text?.trim();
    const href = resolveSafeUrl(content.url);
    const imgNode = <img src={src} alt={captionText ?? ''} />;

    return (
        <figure>
            {href ? <a href={href}>{imgNode}</a> : imgNode}
            {captionText ? <figcaption>{href ? <a href={href}>{captionText}</a> : captionText}</figcaption> : null}
        </figure>
    );
};

const renderGalleryBlock = (content: ArticleBlockContent): Child => {
    const figures = (content.images ?? []).flatMap((item) => {
        const src = pickImageUrl(item);
        return src
            ? [
                  <figure>
                      <img src={src} alt="" />
                  </figure>,
              ]
            : [];
    });
    if (figures.length === 0) {
        return null;
    }
    const title = content.title?.trim();
    return (
        <>
            {title ? (
                <p>
                    <strong>{title}</strong>
                </p>
            ) : null}
            {figures}
        </>
    );
};

const renderCodeBlock = (content: ArticleBlockContent): Child => {
    if (!content.code) {
        return null;
    }
    return (
        <pre>
            <code class={content.language ? `language-${content.language}` : undefined}>{content.code}</code>
        </pre>
    );
};

const resolveVimeoEmbedUrl = (parsed: URL): string | undefined => {
    if (parsed.hostname === 'player.vimeo.com') {
        return parsed.pathname.startsWith('/video/') ? parsed.href : undefined;
    }
    if (isHostnameOrSubdomain(parsed.hostname, 'vimeo.com')) {
        const segments = parsed.pathname.split('/').filter(Boolean);
        const videoId = segments.findLast((seg) => /^\d+$/.test(seg));
        return videoId ? `https://player.vimeo.com/video/${videoId}` : undefined;
    }
    return undefined;
};

const renderVideoBlock = (content: ArticleBlockContent): Child => {
    const videoUrl = resolveHttpUrl(content.url);
    if (!videoUrl) {
        return null;
    }
    try {
        const parsed = new URL(videoUrl);
        const lowerPath = parsed.pathname.toLowerCase();
        if (DIRECT_VIDEO_EXTENSIONS.some((ext) => lowerPath.endsWith(ext))) {
            return <video controls src={videoUrl} />;
        }
        const ytId = extractYouTubeId(parsed);
        if (ytId) {
            return <iframe src={`https://www.youtube.com/embed/${ytId}`} allowfullscreen />;
        }
        const vimeoEmbedUrl = resolveVimeoEmbedUrl(parsed);
        if (vimeoEmbedUrl) {
            return <iframe src={vimeoEmbedUrl} allowfullscreen />;
        }
    } catch {
        return null;
    }
    return (
        <p>
            <a href={videoUrl}>{videoUrl}</a>
        </p>
    );
};

const renderIframeWidget = (content: ArticleBlockContent): Child => {
    if (!content.value) {
        return null;
    }
    const $ = load(content.value, null, false);
    const iframeSources = $('iframe')
        .toArray()
        .map((el) => resolveHttpUrl($(el).attr('src')))
        .filter((src): src is string => Boolean(src));

    if (iframeSources.length > 0) {
        return (
            <>
                {iframeSources.map((src) => (
                    <iframe src={src} allowfullscreen />
                ))}
            </>
        );
    }

    return renderHtmlFragment(content.value);
};

const renderSocialLinkQuote = (rawUrl: string | undefined, className: string): Child => {
    const safeUrl = resolveHttpUrl(rawUrl);
    if (!safeUrl) {
        return null;
    }
    return (
        <blockquote class={className}>
            <a href={safeUrl}>{safeUrl}</a>
        </blockquote>
    );
};

const renderInstagramBlockquote = (content: ArticleBlockContent): Child => {
    if (!content.value) {
        return null;
    }
    const $ = load(content.value, null, false);
    const permalink = resolveHttpUrl($('[data-instgrm-permalink]').attr('data-instgrm-permalink') || $('a[href]').first().attr('href'));
    if (!permalink) {
        return null;
    }
    const text = $('a[href]').first().text().trim() || permalink;
    return (
        <blockquote class="instagram-media">
            <a href={permalink}>{text}</a>
        </blockquote>
    );
};

const renderAuthorQuote = (content: ArticleBlockContent): Child => {
    const quoteHtml = sanitizeRichHtml(content.text);
    const imageUrl = pickImageUrl(content.image);
    if (!quoteHtml && !imageUrl) {
        return null;
    }
    return (
        <>
            {quoteHtml ? <blockquote>{raw(quoteHtml)}</blockquote> : null}
            {imageUrl ? (
                <figure>
                    <img src={imageUrl} alt="" />
                </figure>
            ) : null}
        </>
    );
};

const renderAuthorCard = (content: ArticleBlockContent): Child => {
    const name = content.name?.trim();
    if (!name) {
        return null;
    }
    const details = [content.position?.trim(), content.city?.trim()].filter(Boolean).join(', ');
    return (
        <p>
            <strong>{name}</strong>
            {details ? ` (${details})` : null}
        </p>
    );
};

const BLOCK_RENDERERS = new Map<string, (content: ArticleBlockContent) => Child>([
    ['editor', (content) => renderHtmlFragment(content.text)],
    ['description', (content) => renderHtmlFragment(content.text)],
    ['code', renderCodeBlock],
    ['image-widget', renderImageBlock],
    ['image-description', renderImageBlock],
    ['image-link', renderImageLinkBlock],
    ['images', renderGalleryBlock],
    ['image-slider', renderGalleryBlock],
    ['video', renderVideoBlock],
    ['iframe', renderIframeWidget],
    ['twitter', (content) => renderSocialLinkQuote(content.url, 'twitter-tweet')],
    ['instagram', (content) => renderSocialLinkQuote(content.url, 'instagram-media')],
    ['instagram-blockquote', renderInstagramBlockquote],
    ['author-quote', renderAuthorQuote],
    ['author-card', renderAuthorCard],
]);

const renderGroupedBlocks = (blocks: ArticleBlock[]): Child[] => {
    const out: Child[] = [];
    let quoteBuffer: Child[] = [];

    const flushQuotes = () => {
        if (quoteBuffer.length === 0) {
            return;
        }
        out.push(<blockquote>{quoteBuffer}</blockquote>);
        quoteBuffer = [];
    };

    for (const block of blocks) {
        if (block.type === 'quote' && Array.isArray(block.content)) {
            flushQuotes();
            const nested = renderGroupedBlocks(block.content);
            if (nested.length > 0) {
                out.push(<blockquote>{nested}</blockquote>);
            }
            continue;
        }
        if (!block.content || Array.isArray(block.content)) {
            continue;
        }
        const renderer = BLOCK_RENDERERS.get(block.type);
        const node = renderer ? renderer(block.content) : null;
        if (!node) {
            continue;
        }
        if (block.content.isQuote) {
            quoteBuffer.push(node);
        } else {
            flushQuotes();
            out.push(node);
        }
    }

    flushQuotes();
    return out;
};

const shouldIncludeStandfirst = (standfirstHtml: string, blocks: ArticleBlock[]): boolean => {
    const standfirstPlain = extractPlainText(standfirstHtml);
    if (!standfirstPlain) {
        return false;
    }
    const firstEditor = blocks.find((block) => block.type === 'editor' && !Array.isArray(block.content) && block.content?.text);
    if (!firstEditor?.content || Array.isArray(firstEditor.content)) {
        return true;
    }
    const firstPlain = extractPlainText(firstEditor.content.text);
    const prefix = standfirstPlain.slice(0, 60);
    return !prefix || !firstPlain.startsWith(prefix);
};

export const renderArticleDescription = (detail: ArticleDetail, listItem: ArticleListItem): string => {
    const blocks = detail.content ?? [];
    const standfirstHtml = sanitizeRichHtml(detail.description || listItem.description);
    const leadHtml = shouldIncludeStandfirst(standfirstHtml, blocks) ? standfirstHtml : '';
    const bodyNodes = renderGroupedBlocks(blocks);
    const rootIframeUrl = resolveHttpUrl(detail.iframe_url);
    const detailImageUrl = pickImageUrl(detail.image);
    const fallbackCoverUrl = !leadHtml && bodyNodes.length === 0 && !rootIframeUrl ? detailImageUrl || pickImageUrl(listItem.image) || pickImageUrl(listItem.preview) : detailImageUrl;

    return renderToString(
        <>
            {fallbackCoverUrl ? (
                <figure>
                    <img src={fallbackCoverUrl} alt="" />
                </figure>
            ) : null}
            {leadHtml ? raw(leadHtml) : null}
            {bodyNodes}
            {rootIframeUrl ? <iframe src={rootIframeUrl} allowfullscreen /> : null}
        </>
    );
};
