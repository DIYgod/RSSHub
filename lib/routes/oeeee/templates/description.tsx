import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    thumb?: string;
    description?: string;
};

const OeeeeDescription = ({ thumb, description }: DescriptionData) => (
    <>
        {thumb ? (
            <>
                <img src={thumb} />
                <br />
            </>
        ) : null}
        {description ? (
            <>
                <blockquote>
                    <p>{description}</p>
                </blockquote>
                <br />
            </>
        ) : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<OeeeeDescription {...data} />);
