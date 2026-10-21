import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import MarkdownIt from 'markdown-it';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const md = MarkdownIt({
    html: true,
});

export const rootUrl = 'https://utgd.net';
export const apiRootUrl = 'https://api.utgd.net';

function parsePublicationDate(value?: string) {
    if (typeof value !== 'string' || !value) {
        return;
    }

    const date = parseDate(value, 'YYYY-MM-DD HH:mm:ss', true);
    return Number.isFinite(date.getTime()) ? timezone(date, 8) : undefined;
}

export const parseResult = (results, limit) =>
    results.slice(0, limit).map((item) => {
        const id = item.id;
        if ((typeof id !== 'number' || !Number.isFinite(id)) && (typeof id !== 'string' || !id)) {
            throw new Error('Article identifier is missing or invalid');
        }

        return {
            id: String(id),
            title: item.title,
            link: `${rootUrl}/article/${id}`,
            author: item.article_author_displayname ?? item.article_author_display_name,
            pubDate: parsePublicationDate(item.article_published_time),
            category: item.article_category.map((c) => c.category_name),
        };
    });

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
