import { parseDate } from '@/utils/parse-date';

export const loadArticle = (post) => ({
    title: post.title.rendered,
    description: post.content.rendered,
    pubDate: post.date_gmt ? parseDate(`${post.date_gmt}Z`) : undefined,
    updated: post.modified_gmt ? parseDate(`${post.modified_gmt}Z`) : undefined,
    link: post.link,
    author: post._embedded?.author?.[0]?.name,
    category: post._embedded?.['wp:term']?.flat().map((term) => term.name) ?? [],
});
