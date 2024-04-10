import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { art } from '@/utils/render';
import path from 'node:path';

const parseMainImage = ($) => {
    const mainImage = $('figure.mainPhoto');
    const img = mainImage.find('img');
    const author = mainImage.find('span.copyright');
    const caption = mainImage.find('span.imageDescription');

    return art(path.join(__dirname, 'templates/image.art'), {
        url: img.attr('src'),
        alt: img.attr('alt')?.trim(),
        author: author.text()?.trim(),
        caption: caption.text()?.trim(),
    });
};

const parseArticleContent = ($) => {
    const content = $('[itemprop="articleBody"]');
    $('*')
        .contents()
        .filter(function () {
            return this.nodeType === 8;
        })
        .remove();
    content.find('aside').remove();
    content.find('.videoPlayerContainer').remove();
    content.find('.pulsevideo').remove();
    content.find('.adsContainer').remove();
    content.find('.placeholder').remove();
    content.find('.contentPremium').removeAttr('style');
    content.find('div.image').each((i, el) => {
        const img = $(el).find('img');
        const author = $(el).find('span.author');
        const caption = $(el).find('span.caption');
        const html = art(path.join(__dirname, 'templates/image.art'), {
            url: img.attr('src'),
            alt: img.attr('alt')?.trim(),
            caption: caption.text()?.trim(),
            author: author.text()?.trim(),
        });

        $(el).replaceWith(html);
    });

    return content;
};
export { parseArticleContent, parseMainImage };
