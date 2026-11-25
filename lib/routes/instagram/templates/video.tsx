import { renderToString } from 'hono/jsx/dom/server';

type VideoItem = {
    url: string;
    width?: number | string;
    height?: number | string;
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
                    {summary.split('\n').map((line, index) => (
                        <>
                            {index ? <br /> : null}
                            {line}
                        </>
                    ))}
                    <br />
                </>
            ) : null}
            <video controls preload="metadata" poster={image} width={video.width}>
                <source src={video.url} type="video/mp4" />
            </video>
        </>
    );
