import { renderToString } from 'hono/jsx/dom/server';
import { raw } from 'hono/utils/html';

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
