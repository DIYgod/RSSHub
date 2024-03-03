// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://indienova.com';

const parseList = ($) =>
    $('.article-panel')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('h4 a');
            return {
                title: a.text(),
                link: new URL(a.attr('href'), baseUrl).href,
                upvotes: item.find('.number-first').text(),
                comments: item.find('.number-last').text(),
            };
        });

const parseItem = async (item) => {
    const { data: response } = await got(item.link);
    const $ = load(response);

    item.description = $('.single-post').html();
    item.author = $('.header-info > a').text();
    const pubDate = $('.header-info')
        .contents()
        .filter((_, el) => el.nodeType === 3)
        .text()
        .trim()
        .match(/(\d{4}-\d{2}-\d{2})/)?.[0];
    item.pubDate = pubDate ? timezone(parseDate(pubDate, 'YYYY-MM-DD'), +8) : null;

    return item;
};

module.exports = {
    baseUrl,
    parseList,
    parseItem,
};
