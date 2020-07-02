const got = require('@/utils/got');
const cheerio = require('cheerio');

const ProcessFeed = async (link) => {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const pubDate = $('meta[property="og:article:published_time"]')[0].attribs.content;
    const title = $('meta[property="og:title"]')[0].attribs.content;
    const author = $('meta[property="og:article:author"]')[0].attribs.content;
    const cover = $('meta[property="og:image"]')[0].attribs.content;
    const description = $('.StandardArticleBody_body');

    // if the article's cover photo is not the meaningless logo
    if (cover !== 'https://s4.reutersmedia.net/resources_v2/images/rcom-default.png') {
        const image = $('.PrimaryAsset_container img');

        if (image.length > 0) {
            image[0].attribs.src = cover;
        }
    }

    // TODO: handle slideshows and videos

    // remove useless DOMs
    $('.Image_expand-button, .LazyImage_fallback, .Slideshow_caption, .Slideshow_expand-button, .Attribution_container, .StandardArticleBody_trustBadgeContainer').remove();

    return { link, author, pubDate, title, description: description.html() };
};

module.exports = {
    ProcessFeed,
};
