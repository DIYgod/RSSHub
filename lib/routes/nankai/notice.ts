import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/notice',
    categories: ['university'],
    example: '/nankai/notice',
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
            source: ['www.nankai.edu.cn', 'www.nankai.edu.cn/157/list.htm'],
        },
    ],
    name: '通知公告',
    maintainers: ['vicguo0724'],
    handler: async () => {
        const baseUrl = 'https://www.nankai.edu.cn';
        const listUrl = `${baseUrl}/157/list.htm`;
        const { data: response } = await got(listUrl);
        const $ = load(response);

        const list = $('ul.newslist li')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const $time = $item.find('.time');
                const day = $time.find('.time-d').text().trim();
                const monthYear = $time.contents().last().text().trim();
                const pubDate = timezone(parseDate(`${monthYear}-${day}`, 'YYYY-MM-DD'), +8);

                const $link = $item.find('.tit a');
                let href = $link.attr('href') || '';
                href = href.startsWith('http') ? href : new URL(href, baseUrl).href;

                return {
                    title: $link.text().trim(),
                    link: href,
                    pubDate,
                };
            });

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    try {
                        // 判断link如果是https://xb.nankai.edu.cn/的则为校内访问的
                        if (item.link.includes('xb.nankai.edu.cn')) {
                            item.description = '该通知可能需要校内访问权限';
                        } else {
                            const { data: detailResponse } = await got(item.link);
                            const $detail = load(detailResponse);

                            // 提取正文内容
                            const content = $detail('.wp_articlecontent').html() || '';
                            item.description = content;
                        }
                    } catch {
                        // 如果提取正文内容失败，则返回默认内容
                        item.description = '正文内容获取失败';
                    }
                    return item;
                })
            )
        );

        return {
            title: '南开大学通知公告',
            link: listUrl,
            item: items,
        };
    },
};
