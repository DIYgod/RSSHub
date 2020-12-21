const got = require('@/utils/got');
const cheerio = require('cheerio');

const ProcessFeed = async (link) => {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const pubDate = $('meta[property="og:article:published_time"]')[0].attribs.content;
    const title = $('meta[property="og:title"]')[0].attribs.content;
    const author = $('meta[property="og:article:author"]')[0].attribs.content;
    const cover = $('meta[property="og:image"]')[0].attribs.content;
    const description = $('.ArticleBodyWrapper');
    // if the article's cover photo is not the meaningless logo
    if (cover !== 'https://s4.reutersmedia.net/resources_v2/images/rcom-default.png') {
        const image = $('.PrimaryAsset_container img');

        if (image.length > 0) {
            image[0].attribs.src = cover;
        }
    }

    // handle slideshows and videos
    const pageDataPattern = new RegExp(`(?<=<script type="text/javascript">window.RCOM_Data = ){.*}(?=;</script>)`);
    const pageDataFind = response.data.match(pageDataPattern);
    if (pageDataFind) {
        const pageData = JSON.parse(response.data.match(pageDataFind)[0]);

        // keys of this json has random tails, so we have to iterate through them
        Object.keys(pageData).forEach((key) => {
            // videos and slideshow appear only in `article_list`
            if (!key.startsWith('article_list')) {
                return;
            }

            // add full-res pictures at the end
            const slideshowData = pageData[key].first_article.images;
            slideshowData &&
                slideshowData.forEach((imgData) => {
                    description.insertAfter(`<figure>
                                        <img src="${'https:' + imgData.url}"
                                            alt="${imgData.title}">
                                        <figcaption>${imgData.caption}</figcaption>
                                    </figure>`);
                });

            // add full-res pictures at the beginning
            const videoData = pageData[key].first_article.videos;
            videoData &&
                videoData.forEach((videoData) => {
                    description.insertBefore(`<video controls width="250" autoPictureInPicture=true poster=${'https:' + videoData.thumbnail}>
                                            <source src="${'https:' + videoData.url}"
                                                    type="video/mp4">
                                            Sorry, your browser doesn't support embedded videos.
                                        </video>
                                        <caption>${videoData.caption}</caption>`);
                });
        });
    }

    // remove useless DOMs
    description
        .find(
            '.Image_expand-button, .LazyImage_fallback, .Slideshow_container, .Slideshow_caption, .Slideshow_expand-button, .Attribution_container, .StandardArticleBody_trustBadgeContainer, div[class*="SocialTools"], div[class*="SocialTools"], div[class*="Slideshow"]'
        )
        .remove();

    return { link, author, pubDate, title, description: description.html() };
};

module.exports = {
    ProcessFeed,
};
