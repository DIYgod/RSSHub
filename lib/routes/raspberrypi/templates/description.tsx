import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type Image = {
    src: string;
    alt?: string;
};

type DescriptionProps = {
    images?: Image[];
    intro?: string;
    description?: string;
};

export const renderDescription = ({ images, intro, description }: DescriptionProps): string =>
    renderToString(
        <>
            {images?.length ? images.map((image) => (image?.src ? <figure>{image.alt ? <img src={image.src} alt={image.alt} /> : <img src={image.src} />}</figure> : null)) : null}
            {intro ? <blockquote>{intro}</blockquote> : null}
            {description ? raw(description) : null}
        </>
    );
