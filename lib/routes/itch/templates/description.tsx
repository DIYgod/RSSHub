import { raw } from 'hono/jsx';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    images?: string[];
    description?: string;
};

export const renderDescription = ({ images, description }: DescriptionData): string =>
    renderToString(
        <>
            {images?.map((image) => (
                <img src={image} />
            ))}
            {description ? raw(description) : null}
        </>
    );
