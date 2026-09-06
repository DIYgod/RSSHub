import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    intro?: string;
    description?: string;
};

const TmtpostDescription = ({ intro, description }: DescriptionData) => (
    <>
        {intro ? <blockquote>{intro}</blockquote> : null}
        {description ? raw(description) : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<TmtpostDescription {...data} />);
