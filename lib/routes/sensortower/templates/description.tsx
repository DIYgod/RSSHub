import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionRenderOptions = {
    image?: string;
    header?: string;
    description?: string;
};

export const renderDescription = ({ image, header, description }: DescriptionRenderOptions): string =>
    renderToString(
        <>
            {image ? <img src={image} /> : null}
            {header ? <>{raw(header)}</> : null}
            {description ? <>{raw(description)}</> : null}
        </>
    );
