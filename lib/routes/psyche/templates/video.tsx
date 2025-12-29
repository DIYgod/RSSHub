import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

export const renderVideo = (article) => {
    let videoUrl = article.hosterId;
    if (article.hoster === 'vimeo') {
        videoUrl = `https://player.vimeo.com/video/${videoUrl}?dnt=1`;
    } else if (article.hoster === 'youtube') {
        videoUrl = `https://www.youtube-nocookie.com/embed/${videoUrl}`;
    }

    return renderToString(
        <>
            <iframe width="672" height="377" src={videoUrl} frameborder="0" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
            {article.credits ? raw(article.credits) : null}
            {article.description ? raw(article.description) : null}
        </>
    );
};
