// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { load } from 'cheerio';
import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

// const base = 'http://hrbust.edu.cn';
const jwzxBase = 'http://jwzx.hrbust.edu.cn/homepage/';

const columnIdBase = (id) => (id ? `${jwzxBase}infoArticleList.do?columnId=${id}` : `${jwzxBase}infoArticleList.do?columnId=354`);

const renderDesc = (desc) =>
    art(path.join(__dirname, 'templates/description.art'), {
        desc,
    });

const detailPage = (e, cache) =>
    cache.tryGet(e.detailPage, async () => {
        const result = await got(e.detailPage);
        const $ = load(result.data);
        const title = $('div#article h2').text().trim();
        const desc =
            $('div.body').html() &&
            $('div.body')
                .html()
                .replaceAll(/style="(.*?)"/g, '')
                .trim();
        const pubDate = timezone(parseDate($('div#articleInfo ul li').first().text().replaceAll('发布日期：', '').trim()), +8);
        return {
            title: e.title || title,
            description: renderDesc(desc),
            link: e.detailPage,
            pubDate: e.pubDate || pubDate,
        };
    });

const fetchAllArticle = (data, base) => {
    const $ = load(data);
    const article = $('.articleList li div');
    const info = article
        .map((i, e) => {
            const c = load(e);
            const r = {
                title: c('a').first().text().trim(),
                detailPage: new URL(c('a').attr('href'), base).href,
                pubDate: timezone(parseDate(c('span').first().text().trim()), +8),
            };
            return r;
        })
        .get();
    return info;
};

module.exports = {
    // BASE: base,
    JWZXBASE: jwzxBase,
    columnIdBase,
    fetchAllArticle,
    detailPage,
    renderDesc,
};
