import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    image?: string;
    video?: string;
    digest?: string;
};

export const renderExclusiveDescription = ({ image, video, digest }: DescriptionData) =>
    renderToString(
        <>
            {image ? <img src={image} /> : null}
            {video ? (
                <video controls>
                    <source src={video} type="video/mp4" />
                </video>
            ) : null}
            {digest ? <p>{digest}</p> : null}
        </>
    );
