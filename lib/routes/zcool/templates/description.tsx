import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionRenderOptions = {
    video?: string;
    description?: string;
};

export const renderDescription = ({ video, description }: DescriptionRenderOptions): string =>
    renderToString(
        <>
            {video ? (
                <video controls>
                    <source src={video} type="video/mp4" />
                </video>
            ) : null}
            {description ? <>{raw(description)}</> : null}
        </>
    );
