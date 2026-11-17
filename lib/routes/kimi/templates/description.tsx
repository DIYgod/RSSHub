import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

export const renderArticleDescription = (bodyHtml: string, coverUrl?: string): string => {
    const includeCover = Boolean(coverUrl && !bodyHtml.includes(coverUrl));
    return renderToString(
        <>
            {includeCover && coverUrl ? (
                <figure>
                    <img src={coverUrl} alt="" />
                </figure>
            ) : null}
            {raw(bodyHtml)}
        </>
    );
};

export const renderFallbackDescription = (summary: string | undefined, coverUrl?: string): string | undefined => {
    if (!summary && !coverUrl) {
        return undefined;
    }
    return renderToString(
        <>
            {coverUrl ? (
                <figure>
                    <img src={coverUrl} alt="" />
                </figure>
            ) : null}
            {summary ? <p>{summary}</p> : null}
        </>
    );
};
