import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/index/tzgg',
    categories: ['university'],
    example: '/xyu/index/tzgg',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.xyc.edu.cn/index/tzgg.htm'],
        },
    ],
    name: '官网通知公告',
    maintainers: ['JinMokai'],
    handler,
    url: 'www.xyc.edu.cn/index/tzgg.htm',
};

async function handler() {
    const baseUrl = 'https://www.xyc.edu.cn';
    const url = `${baseUrl}/index/tzgg.htm`;

    const response = await ofetch(url);
    if (!response) {
        return {
            title: '新余学院 - 通知公告',
            link: url,
            item: [],
        };
    }

    const $ = load(response);

    const list = $('.text-list ul li')
        .toArray()
        .map((item) => {
            const currentItem = $(item);
            const link = currentItem.find('a').attr('href');
            if (!link) {
                return null;
            }

            const title = currentItem.find('.list-tx h3').text().trim();
            const description = currentItem.find('.list-tx p').text().trim();
            const day = currentItem.find('.date p').text().trim();
            const yearMonth = currentItem.find('.date span').text().trim();
            const dateText = `${yearMonth}-${day.padStart(2, '0')}`;

            return {
                title,
                link: new URL(link, baseUrl).href,
                description: description || title,
                pubDate: timezone(parseDate(dateText, 'YYYY-MM-DD'), +8),
            };
        })
        .filter(Boolean);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item?.link || '', async () => {
                if (!item) {
                    return '';
                }
                try {
                    const detailResponse = await ofetch(item?.link);
                    if (!detailResponse) {
                        return {
                            ...item,
                            description: '该通知无法直接预览，请点击原文链接查看',
                        };
                    }

                    const $$ = load(detailResponse);
                    const content = $$('.v_news_content, .content, .article-content').html();

                    if (content) {
                        const $content = load(content);
                        $content('a').each(function () {
                            const a = $(this);
                            const href = a.attr('href');
                            if (href && !href.startsWith('http')) {
                                a.attr('href', new URL(href, baseUrl).href);
                            }
                        });
                        item.description = $content.html();
                    }

                    return item;
                } catch {
                    return {
                        ...item,
                        description: '该通知无法直接预览，请点击原文链接查看',
                    };
                }
            })
        )
    );

    return {
        title: '新余学院 - 通知公告',
        link: url,
        item: items,
    };
}
