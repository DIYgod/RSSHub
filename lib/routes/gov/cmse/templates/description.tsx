import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    image?: string;
    video?: string;
    description?: string;
};

export const renderDescription = ({ image, video, description }: DescriptionData) =>
    renderToString(
        <>
            {image ? (
                <>
                    <img src={image} />
                    <br />
                </>
            ) : null}
            {video ? (
                <>
                    {raw(video)}
                    <br />
                </>
            ) : null}
            {description ? raw(description) : null}
        </>
    );
