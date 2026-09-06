import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    standfirst?: string;
    coverImage?: string;
    coverCaption?: string;
    article?: string;
};

export const renderDescription = ({ standfirst, coverImage, coverCaption, article }: DescriptionData) =>
    renderToString(
        <>
            {standfirst ? (
                <blockquote>
                    <p>
                        <em>{standfirst}</em>
                    </p>
                </blockquote>
            ) : null}
            {coverImage ? (
                <figure>
                    <img src={coverImage} />
                    {coverCaption ? <figcaption>{coverCaption}</figcaption> : null}
                </figure>
            ) : null}
            {article ? <>{raw(article)}</> : null}
        </>
    );
