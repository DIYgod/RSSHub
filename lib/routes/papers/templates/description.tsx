import { renderToString } from 'hono/jsx/dom/server';

type AuthorData = {
    name?: string;
    url?: string;
};

type DescriptionData = {
    pdfUrl?: string;
    kimiUrl?: string;
    authors?: AuthorData[];
    summary?: string;
};

const PapersDescription = ({ pdfUrl, kimiUrl, authors, summary }: DescriptionData) => (
    <>
        {pdfUrl ? <a href={pdfUrl}>[PDF]</a> : null}
        {kimiUrl ? <a href={kimiUrl}>[Kimi]</a> : null}
        {authors?.length ? (
            <p>
                <b>Authors:</b>
                {authors.map((author) => (
                    <>
                        <a href={author.url}>{author.name}</a>,
                    </>
                ))}
            </p>
        ) : null}
        {summary ? <p>{summary}</p> : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<PapersDescription {...data} />);
