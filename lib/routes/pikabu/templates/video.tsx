import { renderToString } from 'hono/jsx/dom/server';

type VideoData = {
    videoId?: string;
    embedUrl?: string;
    preview?: string;
    width?: string | number;
    mp4?: string;
    webm?: string;
};

export const renderVideo = ({ videoId, embedUrl, preview, width, mp4, webm }: VideoData): string =>
    renderToString(
        videoId || embedUrl ? (
            <iframe id="ytplayer" type="text/html" width="640" height="360" src={embedUrl ?? `https://www.youtube-nocookie.com/embed/${videoId}`} frameborder="0" allowfullscreen></iframe>
        ) : webm || mp4 ? (
            <video controls preload="metadata" poster={preview} width={width}>
                {webm ? <source src={webm} type="video/webm" /> : null}
                {mp4 ? <source src={mp4} type="video/mp4" /> : null}
            </video>
        ) : null
    );
