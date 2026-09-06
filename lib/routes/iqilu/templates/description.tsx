import { renderToString } from 'hono/jsx/dom/server';

type ImageData = {
    src?: string;
    alt?: string;
};

type VideoData = {
    src?: string;
    type?: string;
};

type DescriptionData = {
    image?: ImageData;
    video?: VideoData;
    description?: string;
};

export const renderDescription = ({ image, video, description }: DescriptionData) =>
    renderToString(
        <>
            {image?.src && !video ? (
                <figure>
                    <img src={image.src} alt={image.alt} />
                </figure>
            ) : null}
            {video ? (
                <video poster={image?.src} controls>
                    <source src={video.src} type={video.type} />
                    <object data={video.src}>
                        <embed src={video.src} />
                    </object>
                </video>
            ) : null}
            {description ? <p>{description}</p> : null}
        </>
    );
