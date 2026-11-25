import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

const getVideoMimeType = (src: string) => (src.endsWith('.webm') ? 'video/webm' : 'video/mp4');

export const renderVideo = (desktopSrc?: string, mobileSrc?: string, captionHtml?: string) => {
    const primarySrc = desktopSrc ?? mobileSrc;
    if (!primarySrc) {
        return '';
    }

    const secondarySrc = mobileSrc && mobileSrc !== desktopSrc ? mobileSrc : undefined;

    return renderToString(
        <>
            {secondarySrc ? (
                <video controls preload="metadata">
                    {desktopSrc && <source src={desktopSrc} type={getVideoMimeType(desktopSrc)} />}
                    <source src={secondarySrc} type={getVideoMimeType(secondarySrc)} />
                </video>
            ) : (
                <video src={primarySrc} controls preload="metadata" />
            )}
            <p>
                <a href={primarySrc}>Watch the video</a>
            </p>
            {captionHtml && <figcaption>{raw(captionHtml)}</figcaption>}
        </>
    );
};

export const renderEmbed = (src: string, watchUrl: string, title?: string) =>
    renderToString(
        <>
            <iframe src={src} title={title || 'Embedded video'} width={640} height={360} allow="autoplay; fullscreen" allowFullscreen />
            <p>
                <a href={watchUrl}>Watch the video</a>
            </p>
        </>
    );

export const renderInteractiveNotice = (articleUrl: string, title?: string) =>
    renderToString(
        <p>
            <a href={articleUrl}>{title ? `Interactive diagram on Sierra: ${title}` : 'View interactive diagram on Sierra'}</a>
        </p>
    );

export const renderFallbackDescription = (excerpt: string) => (excerpt ? renderToString(<p>{excerpt}</p>) : '');
