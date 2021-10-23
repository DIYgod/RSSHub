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
    let description = $('div[class^=ArticleBody__content]')[0] ? $('div[class^=ArticleBody__content]') : $('.ArticleBodyWrapper');
    description = description[0] ? description : $('.story-content-container > .container > .article-row');

    // if the article's cover photo is not the meaningless logo
    if (cover !== 'https://s4.reutersmedia.net/resources_v2/images/rcom-default.png') {
        $(`<img src=${cover}>`).insertBefore(description[0]);
    }

    // remove useless DOMs
    description.find('[class^=Summary__summary]').remove();

    // handle slideshows and videos
    const fusionMetadata = $('#fusion-metadata');
    if (fusionMetadata.length > 0) {
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
    } else {
        const nextDataFind = $('script#__NEXT_DATA__');
        if (nextDataFind.length > 0) {
            const nextData = JSON.parse(nextDataFind.html());

            if (nextData.props.initialState.article) {
                // article page
                const slideshowData = nextData.props.initialState.article.stream.images;
                slideshowData &&
                    slideshowData.forEach((imgData) => {
                        description.insertAfter(`<figure>
                                        <img src="${'https:' + imgData.url}">
                                        <figcaption>${imgData.caption}</figcaption>
                                    </figure>`);
                    });

                // add full-res pictures at the beginning
                const videoData = nextData.props.initialState.article.stream.videos;
                videoData &&
                    videoData.forEach((v) => {
                        description.insertBefore(`<video controls width="250" autoPictureInPicture=true poster=${'https:' + v.thumbnail}>
                                            <source src="${'https:' + v.url}"
                                                    type="video/mp4">
                                            Sorry, your browser doesn't support embedded videos.
                                        </video>
                                        <caption>${v.caption}</caption>`);
                    });
            } else if (nextData.props.initialState.video) {
                // video page

                // others are related videos
                const videoData = nextData.props.initialState.video.playlist[0];

                videoData &&
                    description.insertBefore(
                        `<video controls width="250" autoPictureInPicture=true poster=${'https:' + videoData.image} alt="${videoData.title}"">
                            <source src="${videoData.file}">
                            Sorry, your browser doesn't support embedded videos.
                        </video>
                        <caption>${videoData.description}</caption>`
                    );
            }
        }
    }

    return { link, author, pubDate, title, description: description.html(), summary };
};

module.exports = {
    ProcessFeedUS,
};
