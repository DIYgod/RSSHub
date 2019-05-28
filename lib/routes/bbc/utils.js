const ProcessImage = ($, e, c) => {
    const img = $(e).find(c);

    if (img.length > 0) {
        let message;

        // handle cover image and lazy-loading images
        if (img[0].attribs.src) {
            message = `<figure><img referrerpolicy="no-referrer" alt='${img[0].attribs.alt ? img[0].attribs.alt : ''}' src='${img[0].attribs.src.replace(/(?<=\/news\/).*?(?=\/cpsprodpb)/, '600')}'><br><figcaption>`;
        } else {
            message = `<figure><img referrerpolicy="no-referrer" alt='${img[0].attribs['data-alt'] ? img[0].attribs['data-alt'] : ''}' src='${img[0].attribs['data-src'].replace(
                /(?<=\/news\/).*?(?=\/cpsprodpb)/,
                '600'
            )}'><br><figcaption>`;
        }

        // add image caption
        const figcaption = $(e).find('.media-caption__text');
        if (figcaption.length > 0) {
            message += `${$(figcaption[0])
                .text()
                .trim()}`;
        }

        // add image copyright
        const copyright = $(e).find('.story-image-copyright');
        if (copyright.length > 0) {
            message += ` ©${$(copyright[0])
                .text()
                .trim()}`;
        }

        message += '</figcaption></figure>';

        $(message).insertAfter(e);
    }
};

const ProcessVideo = ($, e, c) => {
    const video = $(e).find(c);

    video.each((i, f) => {
        const cover = $(f).children('img.player-with-placeholder__image');
        if (cover.length > 0) {
            $(cover[0]).insertBefore(e);
        }
        const link = $(f).find('figure.js-media-player-unprocessed');
        if (link.length > 0) {
            const url = JSON.parse(link[0].attribs['data-playable']).settings.externalEmbedUrl;
            const message = `<br><a href='${url}'>使用浏览器播视频/view video in browser</a>`;
            $(message).insertAfter(e);
        }
    });
};

const ProcessAVFeed = ($) => {
    const content = $('div.vxp-media__summary');

    const video = $('div.vxp-media__player');

    video.each((i, e) => {
        const cover = $(e).children('img.vxp-media__placeholder-image');
        if (cover.length > 0) {
            $(cover[0]).insertBefore(content[0].firstChild);
        }
        const link = $(e).find('figure.js-media-player-unprocessed');
        if (link.length > 0) {
            const url = JSON.parse(link[0].attribs['data-playable']).settings.externalEmbedUrl;
            const message = `<br><a href='${url}'>使用浏览器播视频/view video in browser</a>`;
            $(message).insertAfter(content[0].firstChild);
        }
    });

    return content.html();
};

const ProcessFeed = ($, link) => {
    // by default treat it as a hybrid news with video and story-body__inner
    let content = $('div.story-body__inner');

    if (content.length === 0) {
        // it's a video news with video and story-body
        content = $('div.story-body');
    }

    // remove useless DOMs
    content.find('div.bbccom_slot, .off-screen, .embed-report-link').each((i, e) => {
        $(e).remove();
    });

    if ($('#comp-media-player').length > 0) {
        // there is a cover video

        let message = `<br><a href='${link}'>使用浏览器播视频/view video in browser</a>`;

        const cover = $('#comp-media-player').find('img.player-with-placeholder__image');

        if (cover.length > 0) {
            // there is a cover image
            message = `<br><img referrerpolicy="no-referrer" src='${cover[0].attribs.src}'>` + message;
        }

        $(message).insertAfter(content[0].lastChild);
    }

    // resize all images and videos
    content.find('figure').each((i, e) => {
        ProcessImage($, e, '.image-and-copyright-container > img');

        // handle lazy-loading images
        ProcessImage($, e, '.js-delayed-image-load');

        ProcessVideo($, e, 'figure.media-with-caption > div.player-with-placeholder', link);

        $(e).remove();
    });

    return content.html();
};

module.exports = {
    ProcessFeed,
    ProcessAVFeed,
};
