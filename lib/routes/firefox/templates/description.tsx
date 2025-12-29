import { renderToString } from 'hono/jsx/dom/server';
import { raw } from 'hono/utils/html';

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
