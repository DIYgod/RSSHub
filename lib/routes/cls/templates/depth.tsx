import { renderToString } from 'hono/jsx/dom/server';
import { raw } from 'hono/utils/html';

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
