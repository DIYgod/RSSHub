import got from '@/utils/got';
import { load } from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';
import asyncPool from 'tiny-async-pool';
import { parseDate } from '@/utils/parse-date';

const asyncPoolAll = async (...args) => {
    const results = [];
    for await (const result of asyncPool(...args)) {
        results.push(result);
    }
    return results;
};

const baseUrl = 'https://tfc-taiwan.org.tw';

const parseList = (item) => {
    const a = item.find('.entity-list-title a');
    return {
        title: a.text(),
        description: item.find('.entity-list-body').text(),
        link: new URL(a.attr('href'), baseUrl).href,
        pubDate: item.find('.post-date').length ? parseDate(item.find('.post-date').text(), 'YYYY-MM-DD') : undefined,
        image: item.find('.entity-list-img img').attr('src').split('?')[0],
    };
};

const parseItems = (list, tryGet) =>
    asyncPoolAll(10, list, (item) =>
        tryGet(item.link, async () => {
            const { data: response } = await got(item.link);
            const $ = load(response);

            $('.field-name-field-addthis, #fb-root, .fb-comments, .likecoin-embed, style[type="text/css"]').remove();

            item.description = art(path.join(__dirname, 'templates/article.art'), {
                headerImage: item.image,
                content: $('#block-system-main .node-content').html(),
            });

            item.pubDate = $('meta[property="article:published_time"]').attr('content');
            item.updated = $('meta[property="article:modified_time"]').attr('content');
            item.category = $('.node-tags .field-item')
                .toArray()
                .map((item) => $(item).text());

            return item;
        })
    );

export { baseUrl, parseList, parseItems };
