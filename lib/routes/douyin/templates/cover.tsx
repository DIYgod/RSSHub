import { renderToString } from 'hono/jsx/dom/server';

type CoverData = {
    img?: string;
    videoList?: string[];
};

export const renderCover = ({ img, videoList }: CoverData): string => {
    const videoUrl = videoList?.[0];

    return renderToString(
        <>
            {img ? (
                videoUrl ? (
                    <a href={videoUrl} rel="noreferrer">
                        <img src={img} style="width: 50%;" />
                    </a>
                ) : (
                    <img src={img} style="width: 50%;" />
                )
            ) : null}
            {img && videoUrl ? (
                <>
                    <br />
                    <br />
                </>
            ) : null}
            {videoUrl ? (
                <a href={videoUrl} rel="noreferrer">
                    视频直链
                </a>
            ) : null}
        </>
    );
};
