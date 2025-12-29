import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.dcfever.com';

const renderTradeDescription = (info, description, photo) =>
    renderToString(
        <>
            <h2>{info.find('.trading_item_title').text()}</h2>
            {info.find('.trading_item_type_tag').text()} {info.find('.trading_item_price').text()}
            <br />
            <table>
                <tr>
                    <th>賣家</th>
                    <td>{info.find('.clearfix .content').eq(0).text()}</td>
                </tr>
                <tr>
                    <th>查詢次數</th>
                    <td>{info.find('.clearfix .content').eq(1).text()}</td>
                </tr>
                <tr>
                    <th>瀏覽次數</th>
                    <td>{info.find('.clearfix .content').eq(2).text()}</td>
                </tr>
                <tr>
                    <th>刊登日期</th>
                    <td>{info.find('.clearfix .content').eq(3).text()}</td>
                </tr>
                <tr>
                    <th>最後更新</th>
                    <td>{info.find('.clearfix .content').eq(4).text()}</td>
                </tr>
                <tr>
                    <th>刊登期至</th>
                    <td>{info.find('.clearfix .content').eq(5).text()}</td>
                </tr>
                <tr>
                    <th>刊登狀態</th>
                    <td>{info.find('.clearfix .content').eq(6).text()}</td>
                </tr>
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

        item.description = renderTradeDescription($('.info_col'), $('.description_text').html(), $photo('.desktop_photo_selector').html());

        return item;
    });

export { baseUrl, parseItem, parseTradeItem };
