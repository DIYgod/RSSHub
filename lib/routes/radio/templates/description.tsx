import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    description?: string;
    enclosure_url?: string;
    enclosure_type?: string;
};

const RadioDescription = ({ description, enclosure_url, enclosure_type }: DescriptionData) => (
    <>
        {description ? <p>{description}</p> : null}
        {enclosure_url && enclosure_type ? (
            <audio controls="controls" preload="metadata">
                <source src={enclosure_url} type={enclosure_type} />
            </audio>
        ) : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<RadioDescription {...data} />);
