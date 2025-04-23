import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
const md = MarkdownIt({
    html: true,
});

export const rootUrl = 'https://utgd.net';
export const apiRootUrl = 'https://api.utgd.net';

export const parseResult = (results, limit) =>
    results.slice(0, limit).map((item) => ({
        id: item.id,
        title: item.title,
        link: `${rootUrl}/article/${item.id}`,
        author: item.article_author_displayname,
        pubDate: timezone(parseDate(item.article_published_time), +8),
        category: item.article_category.map((c) => c.category_name),
    }));

export const parseArticle = (item) =>
    cache.tryGet(`untag-${item.id}`, async () => {
        const data = await ofetch(`${apiRootUrl}/api/v2/article/${item.id}/`);

        item.description = art(path.join(__dirname, 'templates/description.art'), {
            membership: data.article_for_membership,
            image: data.article_image,
            description: md.render(data.article_content),
        });

        item.category = [...data.article_category.map((c) => c.category_name), ...data.article_tag.map((t) => t.tag_name)];

        return item;
    });
