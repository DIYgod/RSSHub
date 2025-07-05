import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import cache from '@/utils/cache';

const baseUrl = 'https://www.dcfever.com';

const parseItem = (item) =>
    cache.tryGet(item.link, async () => {
        const response = await ofetch(item.link);
        const $ = load(response);
        const content = $('div[itemprop="articleBody"], .column_article_content_html');

        const pageLinks = $('.article_multi_page a')
            .not('.selected')
            .toArray()
            .map((i) => ({ link: new URL($(i).attr('href'), item.link).href }));

        if (pageLinks.length) {
            const pages = await Promise.all(
                pageLinks.map(async (pageLink) => {
                    const response = await ofetch(pageLink.link);
                    const $ = load(response);
                    return $('div[itemprop="articleBody"]').html();
                })
            );
            content.append(pages);
        }

        content.find('img').each((_, e) => {
            if (e.attribs.src?.includes('?')) {
                e.attribs.src = e.attribs.src.split('?')[0];
            }
        });

        content.find('p a').each((_, e) => {
            e = $(e);
            if (e.text().startsWith('下一頁為')) {
                e.remove();
            }
        });

        content.find('iframe').each((_, e) => {
            e = $(e);
            if (e.attr('src').startsWith('https://www.facebook.com/plugins/like.php')) {
                e.remove();
            }
        });

        item.description = content.html();
        item.pubDate = parseDate($('meta[property="article:published_time"]').attr('content'));

        return item;
    });

const parseTradeItem = (item) =>
    cache.tryGet(item.link, async () => {
        const response = await ofetch(item.link);
        const $ = load(response);

        const photoSelector = $('#trading_item_section .description')
            .contents()
            .filter((_, e) => e.type === 'comment')
            .toArray()
            .map((e) => e.data)
            .join('');

        const $photo = load(photoSelector, null, false);

        $photo('.selector_text').remove();
        $photo('.selector_image_div').each((_, div) => {
            delete div.attribs.onclick;
        });
        $photo('.desktop_photo_selector img').each((_, img) => {
            if (img.attribs.src.endsWith('_sqt.jpg')) {
                img.attribs.src = img.attribs.src.replace('_sqt.jpg', '.jpg');
            }
        });

        item.description = art(path.join(__dirname, 'templates/trading.art'), {
            info: $('.info_col'),
            description: $('.description_text').html(),
            photo: $photo('.desktop_photo_selector').html(),
        });

        return item;
    });

export { baseUrl, parseItem, parseTradeItem };
