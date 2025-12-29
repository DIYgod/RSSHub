import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type ArticleDetail = {
    images?: string[];
    content?: string;
};

export const renderDepthDescription = (articleDetail: ArticleDetail) =>
    renderToString(
        <>
            {articleDetail.images?.length ? (
                <>
                    {articleDetail.images.map((image) => (
                        <img src={image} key={image} />
                    ))}
                    <br />
                </>
            ) : null}
            {articleDetail.content ? <>{raw(articleDetail.content)}</> : null}
        </>
    );
