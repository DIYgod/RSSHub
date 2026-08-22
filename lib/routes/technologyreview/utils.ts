import { parseDate } from '@/utils/parse-date';

export const apiUrl = 'https://wp.technologyreview.com/wp-json/wp/v2';

export const renderItem = (item) => ({
    title: item.title.rendered,
    link: item.link,
    description: (item.jetpack_featured_media_url ? `<img src="${item.jetpack_featured_media_url}">` : '') + item.content.rendered,
    author: item._embedded.author.map((author) => author.name).join(', '),
    category: item._embedded['wp:term']
        .flat()
        .map((term) => term.name)
        .filter(Boolean),
    pubDate: parseDate(item.date_gmt),
});
