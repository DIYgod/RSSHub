import { load } from 'cheerio';
import pMap from 'p-map';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

/** Read article content and source metadata from the selected elements. */
async function getPageDetails(selector, pageUrl, titleSelector, dateSelector, dateHander = (date) => date) {
    const response = await got(pageUrl);
    const $ = load(response.data);
    const page = $(selector);
    if (!page.length) {
        throw new Error(`Jishou University article content was not found: ${pageUrl}`);
    }
    const date = dateHander($(dateSelector).text());
    const title = $(titleSelector).text();
    return { pageInfo: page.html(), date, title };
}
const getPageItemAndDate = getPageDetails;

export { getPageItemAndDate };

const getCmsDetails = async (link: string) => {
    const response = await got(link);
    const $ = load(response.data);
    const body = $('#articleDiv, .gp-article, .mzw-det > .txt, #js_content, .s_c2_bjq').first();
    const attachments = $('a.gpArticleTitle[href*="docs/"]');
    if (!body.length && !attachments.length) {
        throw new Error(`Jishou University article content was not found: ${link}`);
    }
    body.find('img[data-src]').each((_, el) => {
        $(el).attr('src', $(el).attr('data-src'));
    });
    const author =
        $('.info span, .gp-articleAuthor span')
            .toArray()
            .map(
                (el) =>
                    $(el)
                        .text()
                        .match(/^\s*作者[：:]\s*([^|]*)/)?.[1]
            )
            .find(Boolean) ||
        $('#js_name').text().trim() ||
        undefined;
    return { description: (body.html() ?? '') + $.html(attachments), author };
};

export const getCmsItems = async (pageUrl: string, category: string) => {
    const response = await got(pageUrl);
    const $ = load(response.data);
    const list = $('a.gpTextArea, ul.mzw-list4 li > a').toArray();
    if (!list.length) {
        throw new Error(`Jishou University notices were not found on the first page: ${pageUrl}`);
    }
    return pMap(
        list,
        async (el) => {
            const node = $(el);
            const link = new URL(el.attribs.href, pageUrl).href;
            const title = node.find('.gpArticleTitle, .tit').text();
            const date = node.find('.gpArticleDate').text() || `${node.find('.year').text()}-${node.find('.day').text()}`;
            const details = await cache.tryGet(`jsu:cms:${link}`, () => getCmsDetails(link));
            return { title, link, pubDate: parseDate(`${date}T00:00:00+08:00`), category: [category], ...details };
        },
        { concurrency: 3 }
    );
};
