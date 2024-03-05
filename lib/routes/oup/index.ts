// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import * as path from 'node:path';
import { art } from '@/utils/render';

const rootUrl = 'https://academic.oup.com';

export default async (ctx) => {
    const name = ctx.req.param('name');
    const url = `${rootUrl}/${name}/issue`;

    const response = await got(url);
    const cookies = response.headers['set-cookie'].map((item) => item.split(';')[0]).join(';');
    const $ = load(response.data);
    const list = $('div.al-article-items')
        .map((_, item) => ({
            title: $(item).find('a.at-articleLink').text(),
            link: new URL($(item).find('a.at-articleLink').attr('href'), rootUrl).href,
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    headers: {
                        Cookie: cookies,
                    },
                });
                const content = load(detailResponse.data);

                item.author = content('a.linked-name.js-linked-name-trigger').text();
                item.description = art(path.join(__dirname, 'templates/article.art'), {
                    abstractContent: content('section.abstract > p.chapter-para').text(),
                    keywords: content('div.kwd-group > a')
                        .map((_, item) => $(item).text())
                        .get()
                        .join(','),
                });
                item.pubDate = parseDate(content('div.citation-date').text());

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `OUP - ${name}`,
        link: url,
        item: items,
    });
};
