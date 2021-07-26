const got = require('@/utils/got');
const cheerio = require('cheerio');

const ProcessFeedUS = async (link) => {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const pubDate = $('meta[name="article:published_time"]').attr('content');
    const title = $('meta[property="og:title"]')[0].attribs.content;
    const author = $('meta[name="article:author"]').attr('content');
    const cover = $('meta[property="og:image"]').length > 0 ? $('meta[property="og:image"]')[0].attribs.content : 'no image';
    const summary = $('[class^=Summary__summary]').html() || $('meta[property="og:description"]')[0].attribs.content;
    const description = $('div[class^=ArticleBody__content]');
    // if the article's cover photo is not the meaningless logo
    if (cover !== 'https://s4.reutersmedia.net/resources_v2/images/rcom-default.png') {
        $(`<img src=${cover}>`).insertBefore(description[0].childNodes[0]);
    }

    // remove useless DOMs
    description.find('[class^=Summary__summary]').remove();

    // handle slideshows and videos
    const fusionMetadata = $('#fusion-metadata');
    const pageDataPattern = new RegExp('(?<=Fusion.globalContent=){.*}(?=;Fusion.globalContentConfig)');
    const pageDataFind = fusionMetadata.html().match(pageDataPattern);
    if (pageDataFind) {
        const pageData = JSON.parse(pageDataFind);

        // keys of this json has random tails, so we have to iterate through them
        Object.keys(pageData).forEach((key) => {
            // videos and slideshow appear only in `article_list`
            if (!key.startsWith('related_content')) {
                return;
            }

            // add full-res pictures at the end
            const slideshowData = pageData[key].galleries.content_elements;
            slideshowData &&
                slideshowData.forEach((imgData) => {
                    description.insertAfter(`<figure>
                                        <img src="${'https:' + imgData.url}"
                                            alt="${imgData.subtitle}">
                                        <figcaption>${imgData.caption}</figcaption>
                                    </figure>`);
                });

            // add full-res pictures at the beginning
            const videoData = pageData[key].first_article.videos;
            videoData &&
                videoData.forEach((v) => {
                    description.insertBefore(`<video controls width="250" autoPictureInPicture=true poster=${'https:' + v.thumbnail}>
                                            <source src="${'https:' + v.url}"
                                                    type="video/mp4">
                                            Sorry, your browser doesn't support embedded videos.
                                        </video>
                                        <caption>${v.caption}</caption>`);
                });
        });
    }

    return { link, author, pubDate, title, description: description.html(), summary };
};

module.exports = {
    ProcessFeedUS,
};
