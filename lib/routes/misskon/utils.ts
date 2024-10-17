import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

const getImages = ($content) =>
    $content('div.entry > p img')
        .toArray()
        .map((img) => $content(img).attr('src'));

const getItemDescObj = async (itemLink) => {
    const response = await ofetch(itemLink);
    const $content = load(response);
    const pageCnt = $content('div.page-link a').length ? Number.parseInt($content('div.page-link a').last().text()) : 1;
    const info = $content('div.info > div')
        .find('input')
        .replaceWith(function () {
            return String($content(this).val() || '');
        })
        .end()
        .text()
        .trim();
    const downloadLinks = $content('div.entry > p > a')
        .toArray()
        .map((x) => ({
            text: $content(x).text().trim(),
            href: $content(x).attr('href'),
        }));
    const images = getImages($content);
    const otherImages = await Promise.all(
        [...Array(pageCnt - 1).keys()].map(async (pageIndex) => {
            const pageLink = `${itemLink}${pageIndex + 2}`;
            const pageResponse = await ofetch(pageLink);
            return getImages(load(pageResponse));
        })
    );
    return {
        info: info.split('\n').slice(0, -1),
        downloadLinks,
        images: [...images, ...otherImages.flat()],
    };
};
const getPostItems = async (link) => {
    const response = await ofetch(link);
    const $ = load(response);

    const feedTitle = $('.page-title > span').length ? $('.page-title > span').text() : $('.page-title').text();
    const feedDesc = $('div.archive-meta > p').text();
    const items = $('#main-content article.item-list')
        .toArray()
        .map((item) => {
            const x = $(item);
            const a = x.find('h2 > a').first();
            return {
                title: a.text(),
                link: a.attr('href'),
                category: x
                    .find('span.post-cats > a')
                    .toArray()
                    .map((cat) => $(cat).text()),
            };
        });

    const ret = {
        title: `Misskon - ${feedTitle}`,
        link,
        item: await Promise.all(
            items.map((item) =>
                cache.tryGet(item.link || '', async () => {
                    const descObj = await getItemDescObj(item.link);
                    const dateMatch = descObj.images[0]?.match(/images\/(\d{4}(?:\/\d{2}){2})/);
                    if (dateMatch) {
                        item.pubDate = parseDate(dateMatch[1]);
                    }
                    item.description = art(path.join(__dirname, 'templates/description.art'), descObj);
                    return item;
                })
            )
        ),
    };
    if (feedDesc) {
        ret.description = feedDesc;
    }
    return ret;
};

export { getPostItems };
