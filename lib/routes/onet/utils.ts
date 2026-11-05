import { renderImage } from './templates/image';

const parseMainImage = ($) => {
    const mainImage = $('figure.mainPhoto, article[data-section="article-lead"] .ods-o-article-photo').first();
    const img = mainImage.find('img').first();
    const url = img.attr('src');
    if (!url) {
        return '';
    }
    const author = mainImage.find('span.copyright, .ods-a-source-photo').first();
    const caption = mainImage.find('span.imageDescription, .ods-o-article-photo__caption .ods-a-caption').first();

    return renderImage({
        url,
        alt: img.attr('alt')?.trim(),
        author: author.text()?.trim(),
        caption: caption.text()?.trim(),
    });
};

const parseArticleContent = ($) => {
    const content = $('[itemprop="articleBody"], article[data-section="article-body"]').first();
    $('*')
        .contents()
        .filter((_, el) => el.nodeType === 8)
        .remove();
    content.find('aside').remove();
    content.find('.videoPlayerContainer').remove();
    content.find('.pulsevideo').remove();
    content.find('.adsContainer').remove();
    content.find('.placeholder').remove();
    content.find('ad-default, .ods-m-google-article').remove();
    content.find('.contentPremium').removeAttr('style');
    content.find('div.image').each((i, el) => {
        const img = $(el).find('img');
        const author = $(el).find('span.author');
        const caption = $(el).find('span.caption');
        const html = renderImage({
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
