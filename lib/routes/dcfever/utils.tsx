import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.dcfever.com';

const parseTradeDate = (value: string) => {
    if (!value) {
        return;
    }
    return /^\d{4}-\d{2}-\d{2}/.test(value) ? timezone(parseDate(value), 8) : parseRelativeDate(value.replaceAll('小時', '小时'));
};

const renderTradeDescription = (info, description, photo, details) =>
    renderToString(
        <>
            {info.find('.trading_item_price').text()}
            <br />
            <table>
                {details.map((detail) => (
                    <tr key={detail.label}>
                        <th>{detail.label}</th>
                        <td>{detail.value}</td>
                    </tr>
                ))}
            </table>
            <br />
            {description ? <>{raw(description)}</> : null}
            <br />
            <br />
            {photo ? <>{raw(photo)}</> : null}
        </>
    );

const parseItem = (item) =>
    cache.tryGet(item.link, async () => {
        const response = await ofetch(item.link);
        const $ = load(response);
        const content = $('div[itemprop="articleBody"], .column_article_content_html');
        const authorLine = content.find('p').first();
        const authorMatch = authorLine
            .text()
            .trim()
            .match(/^文(?:、攝影)?[：:](.+)$/);
        if (authorMatch) {
            item.author = authorMatch[1].trim();
            authorLine.remove();
        }

        const pageLinks = $('.article_multi_page a')
            .not('.selected')
            .toArray()
            .map((i) => ({ link: new URL($(i).attr('href')!, item.link).href }));

        if (pageLinks.length) {
            const pages = await Promise.all(
                pageLinks.map(async (pageLink) => {
                    const response = await ofetch(pageLink.link);
                    const $ = load(response);
                    return $('div[itemprop="articleBody"]').html();
                })
            );
            for (const page of pages) {
                if (page) {
                    content.append(page);
                }
            }
        }

        content.find('img').each((_, e) => {
            if (e.attribs.src?.includes('?')) {
                e.attribs.src = e.attribs.src.split('?', 1)[0];
            }
        });

        content.find('p a').each((_, e) => {
            const $e = $(e);
            if ($e.text().startsWith('下一頁為')) {
                $e.remove();
            }
        });

        content.find('iframe').each((_, e) => {
            const $e = $(e);
            if ($e.attr('src')?.startsWith('https://www.facebook.com/plugins/like.php')) {
                $e.remove();
            }
        });

        item.description = content.html();
        item.pubDate = parseDate($('meta[property="article:published_time"]').attr('content')!);

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

        const details = $('.info_col .trading_item_line')
            .toArray()
            .map((element) => ({
                label: $(element).children('.title').text(),
                value: $(element).children('.content').text(),
            }))
            .filter((detail) => detail.label && !['賣家', '買家', '刊登日期', '最後更新'].includes(detail.label));
        item.description = renderTradeDescription($('.info_col'), $('.description_text').html(), $photo('.desktop_photo_selector').html(), details);
        item.category = $('.info_col .trading_item_type_tag')
            .toArray()
            .map((element) => $(element).text());
        const published = $('.info_col .trading_item_line').filter((_, element) => $(element).children('.title').text() === '刊登日期');
        const updated = $('.info_col .trading_item_line').filter((_, element) => $(element).children('.title').text() === '最後更新');
        item.pubDate = parseTradeDate(published.children('.content').text());
        item.updated = parseTradeDate(updated.children('.content').text());

        return item;
    });

export { baseUrl, parseItem, parseTradeItem };
