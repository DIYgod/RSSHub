import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { WPPost } from './types';

const processLazyImages = ($) => {
    $('a.thumb-photo').each((_, elem) => {
        const $elem = $(elem);
        const largePhotoUrl = $elem.attr('href');
        if (largePhotoUrl) {
            $elem.find('img').attr('src', largePhotoUrl);
        }
    });

    $('.caption').remove();
};

async function loadArticle(link, item: WPPost | null = null) {
    // If item data is provided, use it directly
    if (item) {
        const article = load(item.content.rendered);
        processLazyImages(article);

        return {
            title: item.title.rendered,
            description: article.html() ?? '',
            pubDate: parseDate(item.date),
            link,
        };
    }

    const response = await got(link);
    const article = load(response.body);

    const title = article('h1.entry-title').text().trim();
    processLazyImages(article);

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
