import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionImage = {
    src?: string;
    alt?: string;
};

type DescriptionRenderOptions = {
    intro?: string;
    description?: string;
    images?: DescriptionImage[];
};

export const renderDescription = ({ intro, description, images }: DescriptionRenderOptions): string =>
    renderToString(
        <>
            {intro ? <blockquote>{intro}</blockquote> : null}
            {description ? <>{raw(description)}</> : null}
            {images?.map((image) =>
                image?.src ? (
                    <figure>
                        <img src={image.src} alt={image.alt ?? undefined} />
                    </figure>
                ) : null
            )}
        </>
    );
