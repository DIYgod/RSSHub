import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { SupabaseArticleContent } from '../utils';

export const renderArticleDescription = (article: SupabaseArticleContent): string =>
    renderToString(
        <>
            {article.heroImageUrl && (
                <figure>
                    <img src={article.heroImageUrl} alt={article.heroAlt ?? ''} />
                </figure>
            )}
            {article.bodyHtml && raw(article.bodyHtml)}
        </>
    );
