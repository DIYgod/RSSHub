import { load } from 'cheerio';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const baseUrl = 'https://tfc-taiwan.org.tw';

const bylinePattern = /^[（(]?記者[：／]([^；;）)]+)[；;]\s*責任編輯[：／][^）)]+[）)]?$/;

const parsePostItem = (item) => {
    const $ = load(item.content.rendered, null, false);
    const byline = $('p').filter((_, element) => bylinePattern.test($(element).text()));
    const author = bylinePattern.exec(byline.text())?.[1];
    byline.remove();
    const titleText = $('<span>').html(item.title.rendered).text();
    $('style, .wp-block-outermost-social-sharing').remove();
    $('.wp-block-kadence-advancedheading')
        .filter((_, element) => $(element).text() === titleText || /^發佈：\d{4}-\d{2}-\d{2}$/.test($(element).text()))
        .remove();
    $('.wp-block-kadence-dynamiclist')
        .filter((_, element) => {
            const links = $(element).find('a');
            return links.length > 0 && links.toArray().every((link) => $(link).attr('href')?.startsWith(`${baseUrl}/category/`));
        })
        .remove();
    return {
        title: item.title.rendered,
        pubDate: parseDate(`${item.date_gmt}Z`),
        updated: parseDate(`${item.modified_gmt}Z`),
        link: item.link,
        description: $.html(),
        image: item.yoast_head_json.og_image[0].url,
        author: author ?? item.author_info.display_name,
        category: item.category_info.map((cat) => cat.name),
    };
};

export const parseItem = (postsResponse) => postsResponse.map((item) => parsePostItem(item));

export const parsePost = (limit, categoryId) =>
    cache.tryGet(`tfc-taiwan:posts:${categoryId ?? 'latest'}:${limit}`, () =>
        ofetch(`${baseUrl}/wp-json/wp/v2/posts`, {
            query: {
                categories: categoryId,
                per_page: limit,
            },
        })
    );
