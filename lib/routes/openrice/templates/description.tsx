import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    description: string;
    image?: string | null;
};

export const renderDescription = ({ description, image }: DescriptionData): string =>
    renderToString(
        <>
            {description}
            {image ? <img src={image} /> : null}
        </>
    );
