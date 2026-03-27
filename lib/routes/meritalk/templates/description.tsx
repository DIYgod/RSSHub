import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionParams = {
    featuredImage?: string;
    fullContent?: string;
};

export const renderDescription = ({ featuredImage, fullContent }: DescriptionParams) =>
    renderToString(
        <>
            {featuredImage ? (
                <>
                    {raw(featuredImage)}
                    <br />
                </>
            ) : null}

            {fullContent ? raw(fullContent) : null}
        </>
    );
