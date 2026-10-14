import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    pdfUrl?: string;
    kimiUrl?: string;
    summary?: string;
};

const PapersDescription = ({ pdfUrl, kimiUrl, summary }: DescriptionData) => (
    <>
        {pdfUrl ? <a href={pdfUrl}>[PDF]</a> : null}
        {kimiUrl ? <a href={kimiUrl}>[Kimi]</a> : null}
        {summary ? <p>{summary}</p> : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<PapersDescription {...data} />);
