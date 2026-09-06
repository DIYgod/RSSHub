import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionImage = {
    src?: string;
    alt?: string;
};

type DescriptionData = {
    image?: DescriptionImage;
    description?: string;
};

export const renderDescription = ({ image, description }: DescriptionData) =>
    renderToString(
        <>
            {image?.src ? <figure>{image.alt ? <img src={image.src} alt={image.alt} /> : <img src={image.src} />}</figure> : null}
            {description ? raw(description) : null}
        </>
    );
