import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    intro?: string;
    description?: string;
};

export const renderDescription = ({ intro, description }: DescriptionData) =>
    renderToString(
        <>
            {intro ? <blockquote>{intro}</blockquote> : null}
            {description ? <>{raw(description)}</> : null}
        </>
    );
