import { renderToString } from 'hono/jsx/dom/server';

export const renderComic = (contents: string[]) =>
    renderToString(
        <>
            {contents.map((img) => (
                <img src={img} />
            ))}
        </>
    );
