import { renderToString } from 'hono/jsx/dom/server';
import { raw } from 'hono/utils/html';

type DescriptionData = {
    intro?: string;
    description?: string;
};

const HitDescription = ({ intro, description }: DescriptionData) => (
    <>
        {intro ? <blockquote>{intro}</blockquote> : null}
        {description ? raw(description) : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<HitDescription {...data} />);
