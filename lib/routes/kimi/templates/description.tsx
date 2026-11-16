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

export const renderFallbackDescription = (summary: string | undefined, title: string, link: string, coverUrl?: string): string =>
    renderToString(
        <>
            {coverUrl ? (
                <figure>
                    <img src={coverUrl} alt="" />
                </figure>
            ) : null}
            {summary ? (
                <p>{summary}</p>
            ) : (
                <p>
                    <a href={link}>{title}</a>
                </p>
            )}
        </>
    );
