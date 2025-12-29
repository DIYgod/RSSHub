import { renderToString } from 'hono/jsx/dom/server';
import { raw } from 'hono/utils/html';

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
