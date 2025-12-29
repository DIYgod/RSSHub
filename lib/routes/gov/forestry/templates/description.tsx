import { renderToString } from 'hono/jsx/dom/server';

type ImageData = {
    src?: string;
    alt?: string;
};

type VideoData = {
    src?: string;
};

type DescriptionData = {
    image?: ImageData;
    video?: VideoData;
};

export const renderDescription = ({ image, video }: DescriptionData) =>
    renderToString(
        <>
            {image ? (
                <figure>
                    <img src={image.src} alt={image.alt} />
                </figure>
            ) : null}
            {video ? (
                <video controls>
                    <source src={video.src} />
                    <object data={video.src}>
                        <embed src={video.src} />
                    </object>
                </video>
            ) : null}
        </>
    );
