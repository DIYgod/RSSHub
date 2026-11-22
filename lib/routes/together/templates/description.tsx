import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

export const renderDescription = (bodyHtml: string, coverUrl?: string): string =>
    renderToString(
        <>
            {coverUrl ? (
                <figure>
                    <img src={coverUrl} alt="" />
                </figure>
            ) : null}
            {bodyHtml ? raw(bodyHtml) : null}
        </>
    );

export const renderAudioSample = (audioUrl: string, title?: string): string =>
    renderToString(
        <figure>
            {title ? <figcaption>{title}</figcaption> : null}
            <audio controls preload="metadata" src={audioUrl} />
            <p>
                <a href={audioUrl}>Listen to audio</a>
            </p>
        </figure>
    );

export const renderVideo = (videoUrl: string, videoType?: string, posterUrl?: string): string =>
    renderToString(
        <figure>
            <video controls preload="metadata" poster={posterUrl}>
                <source src={videoUrl} type={videoType || 'video/mp4'} />
            </video>
            <p>
                <a href={videoUrl}>Watch the video</a>
            </p>
        </figure>
    );

export const renderEmbed = (src: string, watchUrl: string, title?: string): string =>
    renderToString(
        <figure>
            <iframe src={src} title={title || 'Embedded video'} width={640} height={360} allow="autoplay; fullscreen" allowFullscreen />
            <p>
                <a href={watchUrl}>Watch the video</a>
            </p>
        </figure>
    );

export const renderFallbackDescription = (excerpt: string): string | undefined => (excerpt ? renderToString(<p>{excerpt}</p>) : undefined);
