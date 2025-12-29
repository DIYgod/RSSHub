import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    head: {
        og_image?: { url: string }[];
    };
    rendered: string;
};

export const renderDescription = ({ head, rendered }: DescriptionData): string =>
    renderToString(
        <>
            {head.og_image?.length ? head.og_image.map((img) => <img src={img.url.split('?')[0]} />) : null}
            {head.og_image?.length ? <br /> : null}
            {raw(rendered)}
        </>
    );
