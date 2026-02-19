import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import { renderVideoMedia } from './video-media';

type LedeMedia = {
    kind?: string;
    src?: string;
    description?: string;
    caption?: string;
    credit?: string;
    video?: {
        stream?: string;
        mp4?: string;
        coverUrl?: string;
        caption?: string;
    };
};

export const renderLedeMedia = (media: LedeMedia) => {
    if (media?.kind === 'video') {
        return renderVideoMedia(media.video ?? {});
    }

    if (media?.kind === 'image') {
        return renderToString(
            <figure>
                <img src={media.src} alt={media.description} loading="lazy" style="display:block; margin-left:auto; margin-right:auto; width:100%;" />
                {media.caption ? (
                    <figcaption>
                        <div class="caption">{raw(media.caption)}</div>
                        <div class="credit">{media.credit ? raw(media.credit) : null}</div>
                    </figcaption>
                ) : null}
            </figure>
        );
    }

    return '';
};
