import { renderToString } from 'hono/jsx/dom/server';

type IndexTemplateData = {
    link: string;
    poster: string;
};

export const renderIndexDescription = ({ link, poster }: IndexTemplateData) =>
    renderToString(
        <a href={link}>
            <img src={poster} />
        </a>
    );
