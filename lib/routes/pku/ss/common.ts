import { load } from 'cheerio';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const getSingleRecord = async (url) => {
    const res = await got(url);

    const $ = load(res.data);
    const list = $('#info-list-ul li, ul.tz-list > li');

    return list.toArray().flatMap((item) => {
        const $item = $(item);
        const anchor = $item.find('a').first();
        const href = anchor.attr('href');
        if (!href) {
            return [];
        }
        const date = $item.find('.time, .date').text().trim();
        return { title: anchor.attr('title') || anchor.find('h3').text(), pubDate: date ? parseDate(/^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00Z` : date) : undefined, link: new URL(href, url).href };
    });
};

const getArticle = async (item) => {
    const article = await cache.tryGet(`pku:ss:article:v2:${item.link}`, async () => {
        const response = await got(item.link);
        const $ = load(response.data);

        const description = $('.gp-article').length ? `${$('.gp-article').html() ?? ''}${$('.attachment').toString()}` : $('.article-content').html();
        return { description };
    });
    return { ...item, ...article };
};

export { getArticle, getSingleRecord };
