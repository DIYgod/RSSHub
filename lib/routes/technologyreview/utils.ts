import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const apiUrl = 'https://wp.technologyreview.com/wp-json/wp/v2';

export const renderItem = (item) => ({
    title: item.title.rendered,
    link: item.link,
    description: (item.jetpack_featured_media_url ? `<img src="${item.jetpack_featured_media_url}">` : '') + item.content.rendered,
    author:
        item._embedded.author
            .map((author) => author.name)
            .filter(Boolean)
            .join(', ') || undefined,
    category: item._embedded['wp:term']
        .flat()
        .map((term) => term.name)
        .filter(Boolean),
    pubDate: item.date_gmt ? parseDateInTimezone(item.date_gmt, 0) : undefined,
});
