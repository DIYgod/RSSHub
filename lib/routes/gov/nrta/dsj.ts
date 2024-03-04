// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const asyncPool = require('tiny-async-pool');

export default async (ctx) => {
    const { category = 'note' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;

    const rootUrl = 'https://dsj.nrta.gov.cn';
    const currentUrl = new URL(`tims/site/views/applications.shanty?appName=${category}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const items = $('img[src="/site/styles/default/images/icon_arrow_r.gif"]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item).next();

            const pubDateMatches = item.text().match(/(\d+年\d+月)/);

            return {
                title: item.text(),
                link: new URL(item.prop('href'), rootUrl).href,
                pubDate: pubDateMatches ? parseDate(pubDateMatches[1], ['YYYY年MM月', 'YYYY年M月']) : undefined,
            };
        });

    const results = [];

    for await (const item of asyncPool(5, items, (item) =>
        cache.tryGet(item.link, async () => {
            const { data: detailResponse } = await got(item.link);

            const content = load(detailResponse);

            content('table').last().remove();

            item.description = content('td.newstext').html() || content('table').last().parent().parent().html();

            return item;
        })
    )) {
        results.push(item);
    }

    ctx.set('data', {
        item: results,
        title: `${$('title').text()}-${$('div.headbottom_menu_selected').text()}`,
        link: currentUrl,
        description: $('td').last().text(),
        language: 'zh-cn',
        image: $('img').first().prop('src'),
        author: '国家广播电影电视总局电视剧管理司',
    });
};
