import { renderToString } from 'hono/jsx/dom/server';

const processImageAttributes = ($img) => {
    if (!$img.attr('src') && $img.attr('srcSet')) {
        const srcs = $img.attr('srcSet').split(', ');
        const lastSrc = srcs.at(-1);
        if (lastSrc) {
            $img.attr('src', lastSrc.split(' ')[0]);
        }
    }
    $img.removeAttr('srcset').removeAttr('sizes');
};

const buildCleanFigure = (src, alt, figcaptionContent) =>
    renderToString(
        <figure>
            <img src={src} alt={alt} referrerpolicy="no-referrer" />
            {figcaptionContent && <figcaption>{figcaptionContent}</figcaption>}
        </figure>
    );

const cleanFigureElement = ($, figure) => {
    const $figure = $(figure);
    const $img = $figure.find('img');

    if ($img.length === 0) {
        return;
    }

    processImageAttributes($img);

    let sourceText = '';
    let captionText = '';

    // extract image source: (simp chinese/trad chinese)
    const $sourceP = $figure.find('p[class*="css-"]').first();
    if ($sourceP.length > 0) {
        const sourceSpans = $sourceP.find('span');
        if (sourceSpans.length >= 2) {
            sourceText = sourceSpans.eq(1).text().trim();
        }
    }

    let $figcaption = $figure.find('figcaption');

    // english version
    if ($figcaption.length === 0) {
        const $next = $figure.next();
        if ($next.length > 0) {
            $figcaption = $next.find('figcaption');
            // if found, remove the sibling div after extracting caption
            if ($figcaption.length > 0) {
                $next.remove();
            }
        }
    }

    if ($figcaption.length > 0) {
        // try to find caption in specific elements, excluding visually-hidden labels
        const $captionParagraph = $figcaption.find('[data-testid="caption-paragraph"]');

        if ($captionParagraph.length > 0) {
            captionText = $captionParagraph.text().trim();
        } else {
            // remove visually-hidden elements (like "Image caption, " labels)
            const $figcaptionClone = $figcaption.clone();
            $figcaptionClone.find('.visually-hidden, [class*="VisuallyHidden"]').remove();
            captionText = $figcaptionClone.text().trim();
        }
    }

    const parts = [sourceText, captionText].filter(Boolean);
    const figcaptionContent = parts.join(' / ');

    $figure.replaceWith(buildCleanFigure($img.attr('src'), $img.attr('alt') || '', figcaptionContent));
};

const ProcessFeed = ($) => {
    // by default treat it as a hybrid news with video and story-body__inner
    let content = $('#main-content article');

    if (content.length === 0) {
        // it's a video news with video and story-body
        content = $('div.story-body');
    }

    if (content.length === 0) {
        // chinese version has different structure
        content = $('main[role="main"]');
    }

    // remove useless DOMs
    content.find('header, section, [data-testid="bbc-logo-wrapper"]').remove();

    // remove article title as it's already in RSS item title
    content.find('h1').remove();

    content.find('noscript').each((i, e) => {
        $(e).parent().html($(e).html());
    });

    // clean up figure elements with images
    content.find('figure').each((i, figure) => cleanFigureElement($, figure));

    // handle standalone images with figcaption siblings (English version)
    content
        .find('img')
        .not('figure img')
        .each((i, img) => {
            const $img = $(img);
            processImageAttributes($img);

            // check for figcaption sibling
            const $next = $img.next();
            if ($next.length > 0 && $next.find('figcaption').length > 0) {
                const captionText = $next.find('figcaption').first().text().trim();
                if (captionText) {
                    $img.replaceWith(buildCleanFigure($img.attr('src'), $img.attr('alt') || '', captionText));
                    $next.remove();
                }
            }
        });

    content.find('[data-component="media-block"] figcaption').prepend('<span>View video in browser: </span>');

    return content.html();
};

export default { ProcessFeed };
