import { renderToString } from 'hono/jsx/dom/server';

export const renderFallbackDescription = (summary: string | undefined, link: string, title: string): string => renderToString(<p>{summary || <a href={link}>{title}</a>}</p>);

export const renderMediaFallbackDescription = (summary: string | undefined, link: string, title: string, image?: string, videoUrl?: string): string =>
    renderToString(
        <>
            {image && (
                <figure>
                    <img src={image} alt="" />
                </figure>
            )}
            <p>{summary || <a href={link}>{title}</a>}</p>
            {videoUrl && (
                <p>
                    <a href={videoUrl}>Watch video</a>
                </p>
            )}
        </>
    );
