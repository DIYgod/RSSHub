import path from 'node:path';

import { load } from 'cheerio';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

const rootUrl = 'http://www.caareviews.org';

const getList = async (url) => {
    const response = await got(url);
    const $ = load(response.data);
    const list = $('#infinite-content > div')
        .toArray()
        .map((item) => ({
            title: $(item).find('div.title').text().trim(),
            link: new URL($(item).find('div.title > em > a').attr('href'), rootUrl).href,
            author: $(item).find('div.contributors').text().trim(),
        }));

    return list;
};

const getItems = (ctx, list) =>
    Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = load(detailResponse.data);

                const coverUrl = new URL($('div.cover > a').attr('href'), rootUrl).href;
                const content = $('div.content.full-review').html();
                item.description = art(path.join(__dirname, 'templates/utils.art'), {
                    coverUrl,
                    content,
                });
                $('div.review_heading').remove();
                item.pubDate = parseDate($('div.header-text > div.clearfix').text());
                item.doi = $('div.crossref > a').attr('href').replace('http://dx.doi.org/', '');

                return item;
            })
        )
    );

export { getItems, getList, rootUrl };
