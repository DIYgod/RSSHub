import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { WPPost } from './types';

const processImages = ($) => {
    $('a').each((_, elem) => {
        const $elem = $(elem);
        const largePhotoUrl = $elem.attr('href')?.replace('i0.wp.com', '').replace('pic.4khd.com', 'yt4.googleusercontent.com').replace('AsHYQ', 'AsYHQ').replace('l/AAA', 'I/AAA');
        if (largePhotoUrl) {
            $elem.attr('href', largePhotoUrl);
            $elem.find('img').attr('src', largePhotoUrl);
        }
    });
};

function loadArticle(item: WPPost) {
    const article = load(item.content.rendered);
    processImages(article);

    return {
        title: item.title.rendered,
        description: article.html() ?? '',
        pubDate: parseDate(item.date_gmt),
        link: item.link,
    };
}

export default loadArticle;
