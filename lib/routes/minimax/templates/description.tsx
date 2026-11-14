import { renderToString } from 'hono/jsx/dom/server';

export const renderFallbackDescription = (summary?: string, coverUrl?: string): string => {
    if (!coverUrl && !summary) {
        return '';
    }
    return renderToString(
        <>
            {coverUrl && <img src={coverUrl} alt="" />}
            {summary && <p>{summary}</p>}
        </>
    );
};

export const renderArticleVideo = (src: string): string => renderToString(<video controls src={src} />);
