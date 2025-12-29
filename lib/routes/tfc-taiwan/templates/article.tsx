import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type ArticleData = {
    headerImage?: string;
    content?: string;
};

const TfcTaiwanArticle = ({ headerImage, content }: ArticleData) => (
    <>
        {headerImage ? (
            <>
                <img src={headerImage} />
                <br />
            </>
        ) : null}
        {content ? raw(content) : null}
    </>
);

export const renderArticle = (data: ArticleData) => renderToString(<TfcTaiwanArticle {...data} />);
