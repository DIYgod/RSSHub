// @ts-nocheck
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

    content.find('noscript').each((i, e) => {
        $(e).parent().html($(e).html());
    });

    content.find('img').each((i, e) => {
        if (!$(e).attr('src') && $(e).attr('srcSet')) {
            const srcs = $(e).attr('srcSet').split(', ');
            const lastSrc = srcs.at(-1);
            $(e).attr('src', lastSrc.split(' ')[0]);
        }
    });

    content.find('[data-component="media-block"] figcaption').prepend('<span>View video in browser: </span>');

    return content.html();
};

module.exports = {
    ProcessFeed,
};
