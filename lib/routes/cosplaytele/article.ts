import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { WPPost } from './types';

async function loadArticle(link, item: WPPost | null = null) {
    // If item data is provided, use it directly
    if (item) {
        return {
            title: item.title.rendered,
            description: item.content.rendered,
            pubDate: parseDate(item.date),
            link,
        };
    }

    const response = await got(link);
    const article = load(response.body);
    article('.crp_related').remove();

    const title = article('h1.entry-title').text().trim();
    const description = article('.entry-content').html() ?? '';
    const pubDate = parseDate(article('time')[0].attribs.datetime);

    return {
        title,
        description,
        pubDate,
        link,
    };
}

export default loadArticle;
