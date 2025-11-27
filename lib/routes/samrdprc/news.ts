import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/:type1/:type2',
    categories: ['government'],
    example: '/samrdprc/news/xfpzh/xfpgnzh',
    parameters: {
        type1: '召回类型ID1，见下表',
        type2: '召回类型ID2，见下表',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    description: `
| 类型中文 | 召回类型ID1 | 召回类型ID2 |
| --- | --- | --- |
| 消费品召回 | xfpzh | xfpgnzh |
| 汽车召回 | qczh | gnzhqc |
`,
    name: '召回信息',
    maintainers: ['a180285'],
    radar: [
        {
            source: ['www.samrdprc.org.cn/:type1/:type2'],
            target: '/news/:type1/:type2',
        },
    ],
    handler: async (ctx) => {
        const baseURL = 'https://www.samrdprc.org.cn';
        const type1 = ctx.req.param('type1');
        const type2 = ctx.req.param('type2');

        const url = `${baseURL}/${type1}/${type2}`;
        const response = await got(url);
        const $ = load(response.body);

        const typeName = $('div.box_main > div.boxl.fl > div.boxl_tit > div > span.fl').text();

        const listSelector = $('div.main > div.box1 > div.box_main > div.boxl.fl > div.boxl_ul > ul > li');
        const items: DataItem[] = await Promise.all(
            listSelector.toArray().map((el) => {
                const item = $(el);

                const title = item.find('a').text();
                const link = url + '/' + item.find('a').attr('href');
                const pubDate = parseDate(item.find('span').text().trim());

                return cache.tryGet(link, async () => {
                    const detail = await got(link);
                    const $ = load(detail.body);

                    const articleHTML = $('div.main > div.box1 > div.box_main > div.boxl.fl > div.show_txt > div.TRS_Editor > div').html() || '';

                    return {
                        title,
                        link,
                        pubDate,
                        description: articleHTML,
                    };
                });
            })
        );

        return {
            title: `${typeName} - 国家市场监督管理总局`,
            link: url,
            item: items as DataItem[],
        };
    },
};
