import { renderToString } from 'hono/jsx/dom/server';

export const renderSearchItemDescription = (imageSrc: string): string =>
    renderToString(
        <figure>
            <img src={imageSrc} />
        </figure>
    );
