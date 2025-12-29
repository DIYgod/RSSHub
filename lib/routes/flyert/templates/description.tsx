import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionImage = {
    src?: string;
    alt?: string;
};

type DescriptionData = {
    images?: DescriptionImage[];
    intro?: string;
    description?: string;
};

export const renderDescription = ({ images, intro, description }: DescriptionData) =>
    renderToString(
        <>
            {images?.length ? images.map((image) => (image?.src ? <figure>{image.alt ? <img src={image.src} alt={image.alt} /> : <img src={image.src} />}</figure> : null)) : null}
            {intro ? <blockquote>{intro}</blockquote> : null}
            {description ? raw(description) : null}
        </>
    );
