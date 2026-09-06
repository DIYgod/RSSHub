import { renderToString } from 'hono/jsx/dom/server';

type UserEmbedProps = {
    useIframe?: boolean;
    id: string;
    poster: string;
    source: string;
};

export const renderUserEmbed = ({ useIframe, id, poster, source }: UserEmbedProps): string =>
    renderToString(
        <>
            {useIframe ? (
                <iframe src={`https://www.tiktok.com/embed/${id}`} height="757" frameborder="0" referrerpolicy="no-referrer"></iframe>
            ) : (
                <video controls loop poster={poster} preload="metadata">
                    <source src={source} />
                </video>
            )}
        </>
    );
