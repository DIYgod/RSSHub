import { load } from 'cheerio';
import iconv from 'iconv-lite';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const BASE_URL = 'http://www.pacilution.com/';

const handler: Route['handler'] = async () => {
    // Fetch the target page
    const response = await got({
        method: 'get',
        url: BASE_URL,
        responseType: 'buffer',
    });
    const $ = load(iconv.decode(response.data, 'gb2312'));

    // Select all list items containing target information
    const ITEM_SELECTOR = 'ul[class*="ullbxwnew"] > li';
    const listItems = $(ITEM_SELECTOR);

    // Map through each list item to extract details
    const contentLinkList = listItems.toArray().map((element) => {
        const title = $(element).find('a').text();
        const relativeHref = $(element).find('a').attr('href') || '';
        const link = `${BASE_URL}${relativeHref}`;

        return {
            title,
            link,
        };
    });

    return {
        title: '普世社会科学研究网最新文章',
        description: '普世社会科学研究网首页上不同板块的最新文章汇总集合',
        link: BASE_URL,
        image: 'http://www.pacilution.com/img/top_banner.jpg',
        item: (
            await Promise.all(
                contentLinkList.map((item) =>
                    cache.tryGet(item.link, async () => {
                        try {
                            const CONTENT_SELECTOR = '#MyContent';
                            const DATE_SELECTOR = 'td[class*="con_info"] > span';
                            const response = await got({
                                method: 'get',
                                url: item.link,
                                responseType: 'buffer',
                            });
                            const targetPage = load(iconv.decode(response.data, 'gb2312'));
                            const content = targetPage(CONTENT_SELECTOR).html() || '';
                            const date = parseDate(targetPage(DATE_SELECTOR).text().trim().replaceAll('日', '')).toISOString();
                            return {
                                title: item.title,
                                pubDate: date,
                                link: item.link,
                                description: content,
                                category: ['journal'],
                                guid: item.link,
                                id: item.link,
                                image: 'http://www.pacilution.com/img/top_banner.jpg',
                                content,
                                updated: date,
                                language: 'zh-cn',
                            };
                        } catch {
                            return null as unknown as DataItem;
                        }
                    })
                )
            )
        ).filter((item) => item !== null) as DataItem[],
        allowEmpty: true,
        language: 'zh-cn',
        feedLink: 'https://rsshub.app/pacilution/latest',
        id: 'https://rsshub.app/pacilution/latest',
    };
};

export const route: Route = {
    path: '/latest',
    name: '最新文章',
    maintainers: ['PrinOrange'],
    handler,
    categories: ['journal'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    example: '/pacilution/latest',
    radar: [
        {
            source: ['www.pacilution.com'],
        },
    ],
};
