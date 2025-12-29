import { renderToString } from 'hono/jsx/dom/server';
import { raw } from 'hono/utils/html';

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
