import { renderToString } from 'hono/jsx/dom/server';

export const renderDescription = (description: string, images?: string[]) =>
    renderToString(
        <>
            {description}
            {images?.length ? images.map((image) => <img src={image} />) : null}
        </>
    );
