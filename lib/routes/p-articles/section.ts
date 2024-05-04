import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import { rootUrl, ProcessFeed } from './utils';

export const route: Route = {
    path: '/section/:section',
    categories: ['reading'],
    example: '/section/critics',
    parameters: { section: '版块名称, 可在对应版块 URL 中找到, 子版块链接用`-`连接' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '版块',
    maintainers: ['DW'],
    handler,
};

async function handler(ctx) {
    let section_name: string = ctx.req.param('section');
    section_name = section_name.replace('-', '/');
    section_name += '/';
    const section_url = new URL(section_name, rootUrl).href;
    const response = await ofetch(section_url);
    const $ = load(response);
    const top_info = {
        title: $('div.inner_top_title_01 > h1 > a').text(),
        link: new URL($('div.inner_top_title_01 > h1 > a').prop('href'), rootUrl).href,
    };

    const list = $('div.contect_box_04 > a')
        .map(function () {
            const info = {
                title: $(this).find('h1').text().trim(),
                link: new URL($(this).attr('href'), rootUrl).href,
            };
            return info;
        })
        .get();
    list.unshift(top_info);

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
        title: `虚词 p-articles`,
        link: new URL(section_name, rootUrl).href,
        item: items,
        language: 'zh-cn',
    };
}
