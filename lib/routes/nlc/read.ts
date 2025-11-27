import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { art } from '@/utils/render';

export const route: Route = {
    path: '/read/:type?',
    categories: ['other'],
    example: '/nlc/read/电子图书',
    parameters: { type: '分类，见下表，默认为电子图书' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '读者云平台',
    maintainers: ['nczitzk'],
    handler,
    description: `| [电子图书](http://read.nlc.cn/outRes/outResList?type=电子图书) | [电子期刊](http://read.nlc.cn/outRes/outResList?type=电子期刊) | [电子论文](http://read.nlc.cn/outRes/outResList?type=电子论文) | [电子报纸](http://read.nlc.cn/outRes/outResList?type=电子报纸) | [音视频](http://read.nlc.cn/outRes/outResList?type=音视频) |
| -------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |

| [标准专利](http://read.nlc.cn/outRes/outResList?type=标准专利) | [工具书](http://read.nlc.cn/outRes/outResList?type=工具书) | [少儿资源](http://read.nlc.cn/outRes/outResList?type=少儿资源) |
| -------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------- |`,
};

async function handler(ctx) {
    const { type = '电子图书' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;

    const author = '中国国家图书馆';

    const rootUrl = 'http://read.nlc.cn';
    const currentUrl = new URL(`/outRes/outResList?type=${type}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const items = $('ul.YMH2019_New_GRZX_list7 li a.aa')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('span').first().text();

            return {
                title,
                link: item.prop('onclick').match(/openOutRes\('1','(.*?)','1',/)[1],
                description: art(path.join(__dirname, 'templates/description.art'), {
                    images: item
                        .find('div.pic img')
                        .toArray()
                        .map((i) => {
                            i = $(i);

                            return {
                                src: i.prop('src'),
                                alt: title,
                            };
                        }),
                    intro: item.find('div.txt').prop('title'),
                }),
                author,
                category: [type],
                guid: `nlc-read#${
                    item
                        .prev()
                        .prop('onclick')
                        .match(/\('(\d+)'\)/)[1]
                }`,
            };
        });

    const image = new URL('static/style/css/images/YMH_home_main_logo.png', rootUrl).href;
    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), rootUrl).href;

    return {
        item: items,
        title: `${$('title').text()} - ${type}`,
        link: currentUrl,
        description: type,
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle: type,
        author,
        allowEmpty: true,
    };
}
