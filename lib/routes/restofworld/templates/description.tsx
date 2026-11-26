import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { RestOfWorldArticleContent } from '../utils';

export const renderArticleDescription = (article: RestOfWorldArticleContent): string =>
    renderToString(
        <>
            {article.heroImageUrl && (
                <figure>
                    <img src={article.heroImageUrl} alt={article.heroAlt ?? ''} />
                    {article.heroCaption && <figcaption>{article.heroCaption}</figcaption>}
                </figure>
            )}
            {article.dek && (
                <p>
                    <em>{article.dek}</em>
                </p>
            )}
            {article.bodyHtml && raw(article.bodyHtml)}
        </>
    );
