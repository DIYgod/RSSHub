import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionProps = {
    intro?: string;
    description?: string;
};

const Description = ({ intro, description }: DescriptionProps) => (
    <>
        {intro ? <blockquote>{intro}</blockquote> : null}
        {description ? <>{raw(description)}</> : null}
    </>
);

export const renderDescription = (props: DescriptionProps): string => renderToString(<Description {...props} />);
