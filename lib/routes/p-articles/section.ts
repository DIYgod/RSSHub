import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import { rootUrl, ProcessFeed } from './utils';

export const route: Route = {
    path: '/section/:section',
    categories: ['reading'],
    example: '/p-articles/section/critics',
    parameters: { section: '版块名称, 可在对应版块 URL 中找到, 子版块链接用`-`连接' },
    name: '版块',
    maintainers: ['Insomnia1437'],
    handler,
    radar: [
        {
            source: ['p-articles.com/:section/'],
        },
    ],
};

async function handler(ctx) {
    let sectionName: string = ctx.req.param('section');
    sectionName = sectionName.replace('-', '/');
    sectionName += '/';
    const sectionUrl = new URL(sectionName, rootUrl).href;
    const response = await ofetch(sectionUrl);
    const $ = load(response);
    const topInfo = {
        title: $('div.inner_top_title_01 > h1 > a').text(),
        link: new URL($('div.inner_top_title_01 > h1 > a').prop('href'), rootUrl).href,
    };

    const list = $('div.contect_box_04 > a')
        .toArray()
        .map((element) => {
            const info = {
                title: $(element).find('h1').text().trim(),
                link: new URL($(element).attr('href'), rootUrl).href,
            };
            return info;
        });
    list.unshift(topInfo);

    const items = await Promise.all(
        list.map((info) =>
            cache.tryGet(info.link, async () => {
                const response = await ofetch(info.link);
                // const $ = load(response);
                return ProcessFeed(info, response);
            })
        )
    );
    return {
        title: '虚词 p-articles',
        link: sectionUrl,
        item: items,
        language: 'zh-cn',
    };
}
