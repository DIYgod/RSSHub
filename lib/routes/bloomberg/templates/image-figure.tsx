import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type ImageFigureData = {
    src?: string;
    alt?: string;
    caption?: string;
    credit?: string;
};

export const renderImageFigure = ({ src, alt, caption, credit }: ImageFigureData) =>
    renderToString(
        <figure>
            <img src={src} alt={alt} loading="lazy" style="display:block; margin-left:auto; margin-right:auto; width:100%;" />
            {caption || credit ? (
                <figcaption>
                    <div class="caption">{caption ? raw(caption) : null}</div>
                    <div class="credit">{credit ? raw(credit) : null}</div>
                </figcaption>
            ) : null}
        </figure>
    );
