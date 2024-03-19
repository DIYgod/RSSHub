import { Route } from '@/types';
import cache from '@/utils/cache';
import buildData from '@/utils/common-config';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/lf/jyj/:cat',
    categories: ['government'],
    example: '/lf/jyj/57',
    parameters: { cat: '分类'},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '廊坊市教育局',
    maintainers: ['Samles'],
    handler,
};

async function handler(ctx) {
    const cat = ctx.req.param('cat');
    const link = `http://jyj.lf.gov.cn/?cat=${cat}/`;

    const data =  await buildData({
        link,
        url: link,
        title: `%title%`,
        description: '政府文件库, 当页的所有列表',
        params: {
            title: `'廊坊市教育局 - ' + $('.title > h2 > #addSelect').text().trim()`,
        },
        item: {
            item: '.list > ul > .lf_list_li',
            title: `$('p > a').text()`,
            link: `$('p > a').attr('href')`,
            // pubDate: `$('h4 > .date').text().trim()`,
            pubDate: `$('span.lf_list_time').text().trim()`
        },
    });

    await Promise.all(
        data.item.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: resonse } = await got(item.link);
                const $ = load(resonse);
                item.description = $('.detail > div').first().html();
                return item;
            })
        )
    );

    ctx.set('data', data);

    return data;
    
}