import { renderToString } from 'hono/jsx/dom/server';

type VideoData = {
    videoId?: string;
    preview?: string;
    width?: string | number;
    mp4?: string;
    webm?: string;
};

export const renderVideo = ({ videoId, preview, width, mp4, webm }: VideoData): string =>
    renderToString(
        videoId ? (
            <iframe id="ytplayer" type="text/html" width="640" height="360" src={`https://www.youtube-nocookie.com/embed/${videoId}`} frameborder="0" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
        ) : webm || mp4 ? (
            <video controls preload="metadata" poster={preview} width={width}>
                {webm ? <source src={webm} type="video/webm" /> : null}
                {mp4 ? <source src={mp4} type="video/mp4" /> : null}
            </video>
        ) : null
    );
