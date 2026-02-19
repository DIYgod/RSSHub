import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/newthread',
    categories: ['bbs'],
    example: '/chongbuluo/newthread',
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
            source: ['www.chongbuluo.com/'],
        },
    ],
    name: '最新发表',
    maintainers: ['qiye45'],
    handler,
};

async function handler() {
    const baseUrl = 'https://www.chongbuluo.com';
    const link = `${baseUrl}/forum.php?mod=guide&view=newthread`;

    const response = await ofetch(link);

    const $ = load(response);

    const items = await Promise.all(
        $('#threadlist tbody[id^="normalthread_"]')
            .toArray()
            .map(async (element) => {
                const item = $(element);
                const titleElement = item.find('th.common a.xst');
                const title = titleElement.text().trim();
                const href = titleElement.attr('href') || '';
                const threadLink = href.startsWith('http') ? href : `${baseUrl}/${href}`;

                const author = item.find('td.by cite a').text().trim();

                const pubDateText = item.find('td.by em a span').attr('title') || item.find('td.by em a').text().trim();
                const pubDate = parseDate(pubDateText);

                return await cache.tryGet(threadLink, async () => {
                    try {
                        const threadResponse = await ofetch(threadLink);
                        const $thread = load(threadResponse);

                        // 查找第一个帖子内容
                        const content = $thread('.t_f').first().html()?.trim() || '';

                        return {
                            title,
                            link: threadLink,
                            description: content,
                            pubDate,
                            author,
                        };
                    } catch {
                        return {
                            title,
                            link: threadLink,
                            description: '内容获取失败',
                            pubDate,
                            author,
                        };
                    }
                });
            })
    );

    return {
        title: '虫部落 - 最新发表',
        link,
        description: '虫部落最新发表的帖子',
        item: items,
    };
}
