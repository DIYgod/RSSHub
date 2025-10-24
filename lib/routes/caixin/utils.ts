import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';

const parseArticle = async (item) => {
    if (/\.blog\.caixin\.com$/.test(new URL(item.link).hostname)) {
        return parseBlogArticle(item);
    } else {
        const { data: response } = await got(item.link);

        const $ = load(response);

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
    }
};

const parseBlogArticle = async (item) => {
    const response = await got(item.link);
    const $ = load(response.data);
    const article = $('#the_content').removeAttr('style');
    article.find('img').removeAttr('style');
    article
        .find('p')
        // Non-breaking space U+00A0, `&nbsp;` in html
        // element.children[0].data === $(element, article).text()
        .filter((_, element) => element.children[0].data === String.fromCodePoint(160))
        .remove();

    item.description = article.html();

    return item;
};

export { parseArticle, parseBlogArticle };
