import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import { renderDescription as renderYouTubeDescription } from '@/routes/youtube/utils';

interface DescriptionData {
    videoId?: string;
    transcriptHtml?: string;
    exerciseHref?: string;
    worksheetHref?: string;
    worksheetExt?: string;
}

const CzechStepByStepDescription = ({ videoId, transcriptHtml, exerciseHref, worksheetHref, worksheetExt }: DescriptionData) => (
    <div>
        {videoId && raw(renderYouTubeDescription(true, videoId, undefined, undefined))}

        {transcriptHtml && (
            <>
                <p>
                    <strong>Text zprávy:</strong>
                </p>
                {raw(transcriptHtml)}
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
