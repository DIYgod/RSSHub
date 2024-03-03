// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { load } from 'cheerio';
import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const base = 'http://tfbd.ccf.org.cn';

const urlBase = (caty, id) => base + `/tfbd/${caty}/${id}/`;

const renderDesc = (desc) =>
    art(path.join(__dirname, '../templates/tfbd/description.art'), {
        desc,
    });

const detailPage = (e, cache) =>
    cache.tryGet(e.link, async () => {
        const result = await got(e.link);
        const $ = load(result.data);
        e.description = $('div.articleCon').html();

        return e;
    });

const fetchAllArticles = (data) => {
    const $ = load(data);
    const articles = $('div.file-list div.article-item');
    const info = articles.toArray().map((e) => {
        const c = $(e);
        const r = {
            title: c.find('h3 a[href]').text().trim(),
            link: base + c.find('h3 a[href]').attr('href'),
            pubDate: timezone(parseDate(c.find('p').text().trim(), 'YYYY-MM-DD'), +8),
        };
        return r;
    });
    return info;
};

module.exports = {
    BASE: base,
    urlBase,
    fetchAllArticles,
    detailPage,
    renderDesc,
};
