import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionProps = {
    intro?: string;
    description?: string;
};

export const renderDescription = ({ intro, description }: DescriptionProps): string =>
    renderToString(
        <>
            {intro ? <blockquote>{intro}</blockquote> : null}
            {description ? raw(description) : null}
        </>
    );
