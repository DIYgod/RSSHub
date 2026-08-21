import { renderToString } from 'hono/jsx/dom/server';

export const renderOutlink = (outlink: string): string =>
    renderToString(
        <a href={outlink} target="_blank">
            文章链接
        </a>
    );
