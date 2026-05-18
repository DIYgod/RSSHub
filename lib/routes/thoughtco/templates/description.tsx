import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type ImageData = {
    src?: string;
    width?: string | number;
    height?: string | number;
};

type DescriptionData = {
    image?: ImageData;
    description?: string;
};

export const renderDescription = ({ image, description }: DescriptionData) =>
    renderToString(
        <>
            {image ? (
                <figure>
                    <img src={image.src} />
                </figure>
            ) : null}
            {description ? <>{raw(description)}</> : null}
        </>
    );
