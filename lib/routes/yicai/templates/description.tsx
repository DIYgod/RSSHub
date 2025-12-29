import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionImage = {
    src?: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
};

type DescriptionVideo = {
    src?: string;
    type?: string;
    poster?: string;
};

type DescriptionRenderOptions = {
    image?: DescriptionImage;
    intro?: string;
    video?: DescriptionVideo;
    description?: string;
};

export const renderDescription = ({ image, intro, video, description }: DescriptionRenderOptions): string =>
    renderToString(
        <>
            {!video?.src && image?.src ? (
                <figure>
                    <img src={image.src} alt={image.alt ?? undefined} width={image.width ?? undefined} height={image.height ?? undefined} />
                </figure>
            ) : null}
            {intro ? <p>{intro}</p> : null}
            {video?.src ? (
                <video poster={video.poster ?? image?.src ?? undefined} controls>
                    <source src={video.src} type={video.type ?? undefined} />
                    <object data={video.src}>
                        <embed src={video.src} />
                    </object>
                </video>
            ) : null}
            {description ? <>{raw(description)}</> : null}
        </>
    );
