import { parseDate } from '@/utils/parse-date';

export const loadArticle = (post) => ({
    title: post.title.rendered,
    description: post.content.rendered,
    pubDate: parseDate(post.date_gmt),
    link: post.link,
    author: post._embedded?.author?.[0]?.name,
    category: post._embedded?.['wp:term']?.flat().map((term) => term.name) ?? [],
});
