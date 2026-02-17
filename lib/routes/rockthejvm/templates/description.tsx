import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionRenderOptions = {
    intro?: string;
    description?: string;
};

export const renderDescription = ({ intro, description }: DescriptionRenderOptions): string =>
    renderToString(
        <>
            {intro ? <blockquote>{intro}</blockquote> : null}
            {description ? <>{raw(description)}</> : null}
        </>
    );
