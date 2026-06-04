import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type VideoMediaData = {
    stream?: string;
    mp4?: string;
    coverUrl?: string;
    caption?: string;
};

export const renderVideoMedia = ({ stream, mp4, coverUrl, caption }: VideoMediaData) =>
    renderToString(
        <figure>
            <video
                controls
                playsinline="true"
                webkit-playsinline="true"
                x5-playsinline="true"
                x5-video-player-type="h5"
                x5-video-orientation="landscape|portrait"
                x5-video-player-fullscreen="true"
                x-webkit-airplay="allow"
                preload="metadata"
                poster={coverUrl}
            >
                {stream ? <source src={stream} type="application/x-mpegURL" /> : null}
                {mp4 ? <source src={mp4} type="video/mp4" /> : null}
            </video>
            {caption ? (
                <figcaption>
                    <div class="caption">{raw(caption)}</div>
                </figcaption>
            ) : null}
        </figure>
    );
