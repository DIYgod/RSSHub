import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    thumb?: string;
    description?: string;
};

const SouthcnDescription = ({ thumb, description }: DescriptionData) => (
    <>
        {thumb ? <img src={thumb} /> : null}
        {description ? (
            <blockquote>
                <p>{description}</p>
            </blockquote>
        ) : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<SouthcnDescription {...data} />);
