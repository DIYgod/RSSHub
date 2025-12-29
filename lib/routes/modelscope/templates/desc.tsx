import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    coverImage?: string;
    description?: string;
    md?: string;
};

export const renderDescription = ({ coverImage, description, md }: DescriptionData) =>
    renderToString(
        <>
            {coverImage ? (
                <>
                    <img src={coverImage} />
                    <br />
                </>
            ) : null}
            {description ? (
                <>
                    {description}
                    <br />
                </>
            ) : null}
            {md ? <>{raw(md)}</> : null}
        </>
    );
