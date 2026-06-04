import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    image?: string;
    description?: string;
};

const TheNewsLensDescription = ({ image, description }: DescriptionData) => (
    <>
        {image ? <img src={image} /> : null}
        {description ? raw(description) : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<TheNewsLensDescription {...data} />);
