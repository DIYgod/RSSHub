import { load } from 'cheerio'; // 类似 jQuery 的 API HTML 解析器

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch'; // 统一使用的请求库

export const route: Route = {
    path: '/detail/:name',
    categories: ['multimedia'],
    example: '/btbtla/detail/雍正王朝',
    parameters: { name: '电影 | 电视剧名称' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'BTBTLA | 指定剧名',
    maintainers: ['Hermes1030'],
    handler,
};

async function handler(ctx) {
    const name = ctx.req.param('name');

    const idUrl = await getId(name);
    if (!idUrl) {
        return null;
    }
    const detailLink = 'https://www.btbtla.com' + idUrl;
    const detailResponse = await ofetch(detailLink);
    const $ = load(detailResponse);

    const itemElements = $('div[name=download-list] .module-downlist.selected .module-row-one.active .module-row-info').toArray();

    // 使用缓存处理所有项目
    const items = await Promise.all(
        itemElements.map(async (element) => {
            const $row = $(element);
            const title = $row.find('.module-row-title h4').text().trim();
            const link = $row.find('.module-row-text').attr('href');

            // 使用缓存获取磁力链接
            const magnet = await cache.tryGet(`btbtla:magnet:${link}`, async () => {
                if (link) {
                    return await getMagnet('https://www.btbtla.com' + link);
                }
                return '';
            });

            return {
                title,
                link,
                enclosure_url: magnet,
                enclosure_type: 'application/x-bittorrent',
            };
        })
    );

    const moduleTitle = 'BTBTLA | ' + $('.page-title').text();

    return {
        title: moduleTitle,
        link: detailLink,
        description: moduleTitle,
        item: items,
    };
}

async function getId(name: string) {
    const searchLink = 'https://www.btbtla.com/search/';
    const response = await ofetch(searchLink + name);
    const $ = load(response);
    const link = $(`.module-items .module-item-titlebox a[title="${name}"]`).attr('href');

    // format '/detail/46830832.html'
    return link;
}

async function getMagnet(link: string | undefined) {
    if (!link) {
        return null;
    }
    const response = await ofetch(link);
    const $ = load(response);
    const magnet = $('.btn-important').attr('href');

    return magnet;
}
