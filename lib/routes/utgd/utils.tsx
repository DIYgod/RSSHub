import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import MarkdownIt from '@/utils/markdown-it';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

const md = MarkdownIt({
    html: true,
});

export const rootUrl = 'https://utgd.net';
export const apiRootUrl = 'https://api.utgd.net';

export const parseResult = (results, limit) =>
    results.slice(0, limit).map((item) => ({
        id: String(item.id),
        title: item.title,
        link: `${rootUrl}/article/${item.id}`,
        author: item.article_author_displayname ?? item.article_author_display_name,
        pubDate: parseDate(item.article_published_time, 'YYYY-MM-DD HH:mm:ss', 8),
        category: item.article_category.map((c) => c.category_name),
    }));

export const parseArticle = async (item) => {
    const details = await cache.tryGet<Pick<DataItem, 'description' | 'category'>>(`untag:article-details:v2:${item.id}`, async () => {
        const data = await ofetch(`${apiRootUrl}/api/v2/article/${item.id}/`);

        return {
            description: renderDescription(data.article_image, md.render(data.article_content)),
            category: [...data.article_category.map((c) => c.category_name), ...data.article_tag.map((t) => t.tag_name)],
        };
    });

    return {
        ...item,
        description: details.description,
        category: details.category,
    };
};

const renderDescription = (image: string | undefined, description: string): string =>
    renderToString(
        <>
            {image ? (
                <>
                    <img src={image} />
                    <br />
                </>
            ) : null}
            {description ? raw(description) : null}
        </>
    );
