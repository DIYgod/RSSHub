import { renderToString } from 'hono/jsx/dom/server';

interface DescriptionData {
    videoId?: string;
    paragraphs?: string[];
    exerciseHref?: string;
    worksheetHref?: string;
    worksheetExt?: string;
}

const CzechStepByStepDescription = ({ videoId, paragraphs, exerciseHref, worksheetHref, worksheetExt }: DescriptionData) => (
    <div>
        {videoId && (
            <p>
                <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                    width="560"
                    height="315"
                    frameBorder="0"
                    allowFullScreen
                />
            </p>
        )}

        {paragraphs && paragraphs.length > 0 && (
            <>
                <p>
                    <strong>Text zprávy:</strong>
                </p>
                {paragraphs.map((p, index) => (
                    <p key={index} dangerouslySetInnerHTML={{ __html: p }} />
                ))}
            </>
        )}

        {exerciseHref && (
            <p>
                <strong>Online cvičení:</strong>{' '}
                <a href={exerciseHref} target="_blank" rel="noopener noreferrer">
                    Otevřít online cvičení (Wordwall)
                </a>
            </p>
        )}

        {worksheetHref && (
            <p>
                <strong>Pracovní list:</strong>{' '}
                <a href={worksheetHref} target="_blank" rel="noopener noreferrer">
                    Stáhnout pracovní list ({worksheetExt || 'soubor'})
                </a>
            </p>
        )}
    </div>
);

export const renderDescription = (data: DescriptionData) => renderToString(<CzechStepByStepDescription {...data} />);
