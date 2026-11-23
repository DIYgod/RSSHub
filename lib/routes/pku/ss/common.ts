import { load } from 'cheerio';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

const getSingleRecord = async (url) => {
    const res = await got(url);

    const $ = load(res.data);
    const list = $('ul.tz-list > li');

    return list.toArray().map((item) => {
        const $item = $(item);
        const anchor = $item.find('a');
        return { title: anchor.find('h3').text(), pubDate: parseDate(`${$item.find('.date').text()}T00:00:00Z`), link: new URL(anchor.attr('href')!, url).href };
    });
};

const getArticle = async (item) => {
    const article = await cache.tryGet(`pku:ss:article:v2:${item.link}`, async () => {
        const response = await got(item.link);
        const $ = load(response.data);

        return { description: `${$('.gp-article').html()}${$('.attachment').toString()}` };
    });
    return { ...item, ...article };
};

export { getArticle, getSingleRecord };
