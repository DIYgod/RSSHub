import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import { renderYoutube } from '@/routes/youtube/utils';

export const renderVideo = (article) => {
    let videoUrl = article.hosterId;
    if (article.hoster === 'vimeo') {
        videoUrl = `https://player.vimeo.com/video/${videoUrl}?dnt=1`;
    }

    return renderToString(
        <>
            {article.hoster === 'youtube' ? (
                raw(renderYoutube(true, article.hosterId, undefined, undefined))
            ) : (
                <iframe width="672" height="377" src={videoUrl} frameborder="0" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
            )}
            {article.credits ? raw(article.credits) : null}
            {article.description ? raw(article.description) : null}
        </>
    );
};
