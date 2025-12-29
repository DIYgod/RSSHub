import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    header?: string;
    overview?: string;
    dataClasses?: string;
};

const FirefoxDescription = ({ header, overview, dataClasses }: DescriptionData) => (
    <>
        {header ? raw(header) : null}
        <br />
        {overview ? raw(overview) : null}
        <br />
        {dataClasses ? raw(dataClasses) : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<FirefoxDescription {...data} />);
