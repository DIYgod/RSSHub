import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    image?: string;
    description?: string;
};

export const renderDescription = ({ image, description }: DescriptionData): string =>
    renderToString(
        <>
            {image ? <img src={image} /> : null}
            {description ? raw(description) : null}
        </>
    );
