import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/buct/jwc',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [{ source: ['jiaowuchu.buct.edu.cn/610/list.htm', 'jiaowuchu.buct.edu.cn/611/main.htm'], target: '/jwc' }],
    name: '教务处',
    maintainers: ['Epic-Creeper'],
    handler,
    url: 'buct.edu.cn/',
};

async function handler() {
    const rootUrl = 'https://jiaowuchu.buct.edu.cn';
    const currentUrl = `${rootUrl}/610/list.htm`;

    const response = await got.get(currentUrl);

    const $ = load(response.data);
    const list = $('div.list02 ul > li')
        .not('#wp_paging_w66 li')
        .toArray()
        .map((item) => ({
            pubDate: $(item).find('span').text(),
            title: $(item).find('a').attr('title'),
            link: `${rootUrl}${$(item).find('a').attr('href')}`,
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got.get(item.link);
                const content = load(detailResponse.data);
                const iframeSrc = content('.wp_pdf_player').attr('pdfsrc');
                if (iframeSrc) {
                    const pdfUrl = `${rootUrl}${iframeSrc}`;
                    item.description = `此页面为PDF文档：<a href="${new URL(pdfUrl, rootUrl)}">点击查看pdf</a>`;
                    return item;
                }
                item.description = content('.rt_zhengwen').html();
                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
