import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type Image = {
    src?: string;
    alt?: string;
};

type DescriptionData = {
    images?: Image[];
    description?: string;
};

export const renderDescription = ({ images, description }: DescriptionData): string =>
    renderToString(
        <>
            {images?.map((image) =>
                image?.src ? (
                    <figure>
                        <img src={image.src} alt={image.alt} />
                    </figure>
                ) : null
            )}
            {description ? raw(description) : null}
        </>
    );
