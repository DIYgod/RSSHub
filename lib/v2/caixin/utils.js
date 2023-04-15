const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');

const parseArticle = (item, tryGet) => {
    if (new URL(item.link).hostname.match(/\.blog\.caixin\.com$/)) {
        return parseBlogArticle(item, tryGet);
    } else {
        return tryGet(item.link, async () => {
            const { data: response } = await got(item.link);

            const $ = cheerio.load(response);

            item.description = art(path.join(__dirname, 'templates/article.art'), {
                item,
                $,
            });

            if (item.audio) {
                item.itunes_item_image = item.audio_image_url;
                item.enclosure_url = item.audio;
                item.enclosure_type = 'audio/mpeg';
            }

            return item;
        });
    }
};

const parseBlogArticle = (item, tryGet) =>
    tryGet(item.link, async () => {
        const response = await got(item.link);
        const $ = cheerio.load(response.data);
        const article = $('#the_content').removeAttr('style');
        article.find('img').removeAttr('style');
        article
            .find('p')
            // Non-breaking space U+00A0, `&nbsp;` in html
            // element.children[0].data === $(element, article).text()
            .filter((_, element) => element.children[0].data === String.fromCharCode(160))
            .remove();

        item.description = article.html();

        return item;
    });

module.exports = {
    parseArticle,
    parseBlogArticle,
};
