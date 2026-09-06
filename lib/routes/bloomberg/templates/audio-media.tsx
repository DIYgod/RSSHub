import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type AudioMediaData = {
    img?: string;
    src?: string;
    caption?: string;
    credit?: string;
};

export const renderAudioMedia = ({ img, src, caption, credit }: AudioMediaData) =>
    renderToString(
        <figure>
            <div>
                <img src={img} />
                <audio controls>
                    <source src={src} type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
            </div>
            <figcaption>
                <div class="caption">{caption ? raw(caption) : null}</div>
                <div class="credit">{credit ? raw(credit) : null}</div>
            </figcaption>
        </figure>
    );
