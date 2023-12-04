const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const baseUrl = 'https://www.dcfever.com';

const parseItem = (item, tryGet) =>
    tryGet(item.link, async () => {
        const { data: response } = await got(item.link);
        const $ = cheerio.load(response);
        const content = $('div[itemprop="articleBody"]');

        const pageLinks = $('.article_multi_page a')
            .not('.selected')
            .toArray()
            .map((i) => ({ link: new URL($(i).attr('href'), item.link).href }));

        if (pageLinks.length) {
            const pages = await Promise.all(
                pageLinks.map(async (pageLink) => {
                    const { data: response } = await got(pageLink.link);
                    const $ = cheerio.load(response);
                    return $('div[itemprop="articleBody"]').html();
                })
            );
            content.append(pages);
        }

        content.find('img').each((_, e) => {
            if (e.attribs.src.includes('?')) {
                e.attribs.src = e.attribs.src.split('?')[0];
            }
        });

        content.find('p a').each((_, e) => {
            e = $(e);
            if (e.text().startsWith('下一頁為')) {
                e.remove();
            }
        });

        item.description = content.html();
        item.pubDate = parseDate($('meta[property="article:published_time"]').attr('content'));

        return item;
    });

const parseTradeItem = (item, tryGet) =>
    tryGet(item.link, async () => {
        const { data: response } = await got(item.link);
        const $ = cheerio.load(response);

        $('.selector_text').remove();
        $('.selector_image_div').each((_, div) => {
            delete div.attribs.onclick;
        });
        $('.desktop_photo_selector img').each((_, img) => {
            if (img.attribs.src.endsWith('_sqt.jpg')) {
                img.attribs.src = img.attribs.src.replace('_sqt.jpg', '.jpg');
            }
        });

        item.description = art(path.join(__dirname, 'templates/trading.art'), {
            info: $('.info_col'),
            description: $('.description_text').html(),
            photo: $('.desktop_photo_selector').html(),
        });

        return item;
    });

module.exports = {
    baseUrl,
    parseItem,
    parseTradeItem,
};
