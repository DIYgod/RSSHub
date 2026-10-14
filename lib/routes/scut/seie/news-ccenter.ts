import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const route: Route = {
    path: '/seie/news_center',
    categories: ['university'],
    example: '/scut/seie/news_center',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www2.scut.edu.cn/ee/37355/list.htm', 'www2.scut.edu.cn/ee/16285/list.htm'],
        },
    ],
    name: '电子与信息学院 - 新闻速递',
    maintainers: ['auto-bot-ty'],
    handler,
    url: 'www2.scut.edu.cn/ee/37355/list.htm',
    description: `::: warning
由于学院官网对非大陆 IP 的访问存在限制，需自行部署。
:::`,
};

async function handler() {
    const rootUrl = 'https://www2.scut.edu.cn';
    const url = `${rootUrl}/ee/37355/list.htm`;
    const response = await got(url);
    const $ = load(response.data);

    const list = $('.news-info');
    const articleList = list.toArray().map((item): DataItem => {
        const $item = $(item);
        const titleElement = $item.find('.title a[title]');
        return {
            title: titleElement.attr('title')!,
            link: new URL(titleElement.attr('href')!, url).href,
            pubDate: parseDateInTimezone($item.find('.date').text(), 8),
        };
    });

    const items = await pMap(
        articleList,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`seie:article-v2:${item.link}`, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                content('.wp_articlecontent *').each((_, child) => {
                    const childElem = content(child);
                    childElem.removeAttr('style');
                    childElem.removeAttr('lang');
                    childElem.removeAttr('original-src');
                    childElem.removeAttr('sudyfile-attr');
                    childElem.removeAttr('data-layer');
                    if ((!childElem.text().replace('\n', '').trim().length && !childElem.has('img')) || childElem.attr('name') === '_GoBack' || childElem.is('style')) {
                        childElem.remove();
                    }
                });

                const contentHTML = content('.wp_articlecontent').html();
                item.description = contentHTML!.replaceAll(/^(<br>)+|(<br>)+$/g, '').trim();
                return { description: item.description };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: '华南理工大学电子与信息学院 - 新闻速递',
        link: url,
        item: items,
    };
}
