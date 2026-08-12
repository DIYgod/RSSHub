import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const siteLink = 'https://chinafactcheck.com';

const cleanDom = (dom) => {
    dom('*[style]').removeAttr('style');
    dom('br').remove();
    dom('span:empty').remove();
    dom('span').each((_, el) => {
        if (dom(el).html().trim() === '&nbsp;') {
            dom(el).remove();
        }
    });
    dom('p:empty').remove();
    dom('p').each((_, el) => {
        if (dom(el).html().trim() === '') {
            dom(el).remove();
        }
    });
    return dom;
};

const getArticleDetail = async (link) => {
    const response = await got(link, {
        headers: {
            'user-agent': config.trueUA,
        },
    });
    const $ = cleanDom(load(response.data));

    const title = $('.content-head h2').text();
    const author = $('.content-persons p span:last').text();
    const pubDate = parseDate($('.content-time').text(), 'YYYY-MM-DD');

    const description = $('div[class=content-list-box]').html();
    const category = $('.content-tags a[rel="tag"]')
        .toArray()
        .map((item) => $(item).text());
    const detail: DataItem = { title, author, pubDate, description, category };
    return detail;
};

export default {
    siteLink,
    cleanDom,
    getArticleDetail,
    trueUA: config.trueUA,
};
