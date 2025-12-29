import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionImage = {
    src?: string;
    alt?: string;
};

type DescriptionRenderOptions = {
    images?: DescriptionImage[];
    description?: string;
};

export const renderDescription = ({ images, description }: DescriptionRenderOptions): string =>
    renderToString(
        <>
            {images?.map((image) =>
                image?.src ? (
                    <figure>
                        <img src={image.src} alt={image.alt ?? undefined} />
                    </figure>
                ) : null
            )}
            {description ? <>{raw(description)}</> : null}
        </>
    );
