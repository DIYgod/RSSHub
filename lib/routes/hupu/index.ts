import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { type HomePostItem, type HupuApiResponse, isHomePostItem, type NewsDataItem } from './types';

const categories = {
    nba: {
        title: 'NBA',
        data: 'newsData',
    },
    cba: {
        title: 'CBA',
        data: 'newsData',
    },
    soccer: {
        title: '足球',
        data: 'news',
    },
    '': {
        title: '首页',
        data: 'res',
    },
} as const;

export const route: Route = {
    path: ['/dept/:category?', '/:category?'],
    name: '手机虎扑网',
    url: 'm.hupu.com',
    maintainers: ['nczitzk', 'hyoban'],
    example: '/hupu/nba',
    parameters: {
        category: {
            description: '分类，可选值：nba、cba、soccer，默认为空（首页）',
            default: '',
            options: Object.entries(categories).map(([key, value]) => ({
                label: value.title,
                value: key,
            })),
        },
    },
    description: `::: tip
电竞分类参见 [游戏热帖](https://bbs.hupu.com/all-gg) 的对应路由 [\`/hupu/all/all-gg\`](https://rsshub.app/hupu/all/all-gg)。
:::`,
    categories: ['bbs'],
    radar: [
        {
            source: ['m.hupu.com/:category', 'm.hupu.com/'],
            target: '/:category',
        },
    ],
    handler: async (ctx): Promise<Data> => {
        const c = ctx.req.param('category') || '';
        if (!(c in categories)) {
            throw new Error('Invalid category. Valid options are: ' + Object.keys(categories).filter(Boolean).join(', '));
        }
        const category = c as keyof typeof categories;

        const rootUrl = 'https://m.hupu.com';
        const currentUrl = `${rootUrl}/${category}`;

        const response = await got({
            method: 'get',
            url: currentUrl,
        });

        const scriptMatch = response.data.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
        if (!scriptMatch || !scriptMatch[1]) {
            throw new Error(`Failed to find __NEXT_DATA__ script tag in page: ${currentUrl}`);
        }

        const fullJsonString = scriptMatch[1];
        let fullData;

        try {
            fullData = JSON.parse(fullJsonString);
        } catch (error) {
            throw new Error(`Failed to parse full JSON data: ${error instanceof Error ? error.message : String(error)}`);
        }

        const data: HupuApiResponse = fullData;
        const { pageProps } = data.props;

        const dataKey = categories[category].data;
        if (!(dataKey in pageProps)) {
            throw new Error(`Expected '${dataKey}' property not found in pageProps for category: ${category || 'home'}`);
        }

        const rawDataArray: (HomePostItem | NewsDataItem)[] = (() => {
            const data = (pageProps as any)[dataKey];
            return Array.isArray(data) ? data : [];
        })();

        let items: DataItem[] = rawDataArray.map((item) =>
            isHomePostItem(item)
                ? ({
                      title: item.title,
                      link: item.url.replace(/bbs\.hupu.com/, 'm.hupu.com/bbs'),
                      guid: item.tid,
                      category: item.label ? [item.label] : undefined,
                  } satisfies DataItem)
                : ({
                      title: item.title,
                      pubDate: timezone(parseDate(item.publishTime), +8),
                      link: item.link.replace(/bbs\.hupu.com/, 'm.hupu.com/bbs'),
                      guid: item.tid,
                  } satisfies DataItem)
        );

        items = await Promise.all(
            items
                .filter((item) => item.link && !/subject/.test(item.link))
                .map((item) =>
                    cache.tryGet(item.link!, async () => {
                        try {
                            const detailResponse = await got({
                                method: 'get',
                                url: item.link,
                            });

                            const content = load(detailResponse.data);

                            const author = content('.bbs-user-info-name, .bbs-user-wrapper-content-name-span').text();
                            const pubDateString = content('.second-line-user-info span:not([class])').text();
                            // Possible formats: 10:21, 45分钟前, 09-15 19:57
                            const currentYear = new Date().getFullYear();
                            const currentDate = new Date();
                            const monthDayTimePattern = /^(\d{2})-(\d{2}) (\d{2}):(\d{2})$/;
                            const timeOnlyPattern = /^(\d{1,2}):(\d{2})$/;
                            let processedDateString = pubDateString;

                            if (monthDayTimePattern.test(pubDateString)) {
                                processedDateString = `${currentYear}-${pubDateString}`;
                            } else if (timeOnlyPattern.test(pubDateString)) {
                                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                                const day = String(currentDate.getDate()).padStart(2, '0');
                                processedDateString = `${currentYear}-${month}-${day} ${pubDateString}`;
                            }

                            const pubDate = [item.pubDate, timezone(parseDate(processedDateString), +8), timezone(parseRelativeDate(pubDateString), +8)].find((d) => d instanceof Date && !Number.isNaN(d.getTime()));
                            const categories = content('.basketballTobbs_tag > a, .tag-player-team')
                                .toArray()
                                .map((c) => content(c).text())
                                .filter(Boolean);

                            content('.basketballTobbs_tag').remove();
                            content('.hupu-img').each(function () {
                                const imgSrc = content(this).attr('data-gif') || content(this).attr('data-origin') || content(this).attr('src');
                                content(this).parent().html(`<img src="${imgSrc}">`);
                            });

                            // 分别获取内容元素
                            const descriptionParts: string[] = [];

                            // 获取主要内容
                            const mainContent = content('#bbs-thread-content, .bbs-content-font').html();
                            if (mainContent) {
                                descriptionParts.push(mainContent);
                            }

                            // 单独处理视频部分
                            const videoWrapper = content('.header-video-wrapper');
                            if (videoWrapper.length > 0) {
                                const videoElement = videoWrapper.find('video');
                                if (videoElement.length > 0) {
                                    const videoHtml = videoElement.prop('outerHTML');
                                    if (videoHtml) {
                                        descriptionParts.push(videoHtml);
                                    }
                                }
                            }

                            const description = descriptionParts.length > 0 ? descriptionParts.join('') : undefined;

                            return {
                                ...item,
                                author,
                                category: categories.length > 0 ? categories : item.category,
                                description,
                                pubDate,
                            };
                        } catch {
                            // no-empty
                            return item;
                        }
                    })
                )
        );

        return {
            title: `虎扑 - ${categories[category].title}`,
            link: currentUrl,
            item: items,
        } as Data;
    },
};
