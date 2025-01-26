import { load } from 'cheerio';
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

function loadArticle(item: WPPost) {
    const article = load(item.content.rendered);
    processLazyImages(article);

    return {
        title: item.title.rendered,
        description: article.html() ?? '',
        pubDate: parseDate(item.date_gmt),
        link: item.link,
    };
}

export default loadArticle;
