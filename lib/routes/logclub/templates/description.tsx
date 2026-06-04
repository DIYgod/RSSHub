import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type MediaImage = {
    src?: string;
    alt?: string;
};

type MediaVideo = {
    src?: string;
    type?: string;
    poster?: string;
};

type DescriptionData = {
    image?: MediaImage;
    intro?: string;
    video?: MediaVideo;
    description?: string;
};

export const renderDescription = ({ image, intro, video, description }: DescriptionData) =>
    renderToString(
        <>
            {image?.src ? <figure>{image.alt ? <img src={image.src} alt={image.alt} /> : <img src={image.src} />}</figure> : null}
            {intro ? <p>{intro}</p> : null}
            {video?.src ? (
                <video poster={video.poster || image?.src} controls>
                    <source src={video.src} type={video.type} />
                    <object data={video.src}>
                        <embed src={video.src} />
                    </object>
                </video>
            ) : null}
            {description ? raw(description) : null}
        </>
    );
