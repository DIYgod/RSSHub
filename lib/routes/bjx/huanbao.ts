// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
const asyncPool = require('tiny-async-pool');

const asyncPoolAll = async (...args) => {
    const results = [];
    for await (const result of asyncPool(...args)) {
        results.push(result);
    }
    return results;
};

export default async (ctx) => {
    const listURL = 'https://huanbao.bjx.com.cn/yw/';
    const response = await got(listURL);

    const $ = load(response.data);
    let items = $('.cc-layout-3 .cc-list-content li')
        .toArray()
        .map((e) => {
            e = $(e);
            return {
                title: e.find('a').attr('title'),
                link: e.find('a').attr('href'),
                pubDate: parseDate(e.find('span').text()),
            };
        });

    items = await asyncPoolAll(
        // 服务器禁止单个IP大并发访问，只能少返回几条
        3,
        items,
        (items) => fetchPage(items.link)
    );

    ctx.set('data', {
        title: '北极星环保 - 环保行业垂直门户网站',
        link: listURL,
        item: items,
    });
};

const fetchPage = (link) =>
    cache.tryGet(link, async () => {
        // 可能一篇文章过长会分成多页
        const pages = [];

        const result = await got(link);
        const $page = load(result.data);
        pages.push($page);

        // 如果是有分页链接，则使用顺序加载以保证顺序
        const pagelinks = $page('#article_cont .cc-paging a');

        if (pagelinks.length > 0) {
            for (const pagelink of pagelinks) {
                const $a = $page(pagelink);
                if (!/^\d+$/.test($a.text().trim())) {
                    continue;
                }
                const sublink = new URL($a.attr('href'), link).href;
                /* eslint-disable no-await-in-loop */
                const result = await got(sublink);
                pages.push(load(result.data));
            }
        }

        const item = {
            title: $page('title').text(),
            description: pages.reduce((desc, $p) => desc + $p('.cc-article').html(), ''),
            pubDate: timezone(parseDate($page('.cc-headline .box p span').eq(0).text()), +8),
            link,
            author: $page('.cc-headline .box p span').eq(1).text(),
        };
        return item;
    });
