import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import { renderYoutube } from '@/routes/youtube/utils';

interface DescriptionProps {
    subhead?: string;
    youtubeId?: string;
    bodyHtml: string;
    lockedNotice?: string;
}

export const renderDescription = ({ subhead, youtubeId, bodyHtml, lockedNotice }: DescriptionProps) =>
    renderToString(
        <>
            {subhead && (
                <p>
                    <em>{subhead}</em>
                </p>
            )}
            {youtubeId && (
                <>
                    {raw(renderYoutube(true, youtubeId))}
                    <p>
                        <a href={`https://www.youtube.com/watch?v=${youtubeId}`}>Watch on YouTube</a>
                    </p>
                </>
            )}
            {bodyHtml && <div>{raw(bodyHtml)}</div>}
            {lockedNotice && (
                <p>
                    <em>Preview only. {lockedNotice}.</em>
                </p>
            )}
        </>
    );
