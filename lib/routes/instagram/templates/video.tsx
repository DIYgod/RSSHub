import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type VideoItem = {
    url: string;
    width?: number | string;
};

type VideoRenderOptions = {
    summary?: string;
    image?: string;
    video: VideoItem;
};

export const renderVideo = ({ summary, image, video }: VideoRenderOptions): string =>
    renderToString(
        <>
            {summary ? (
                <>
                    {raw(summary.replaceAll('\n', '<br>'))}
                    <br />
                </>
            ) : null}
            <video controls preload="metadata" poster={image} width={video.width}>
                <source src={video.url} type="video/mp4" />
            </video>
        </>
    );
