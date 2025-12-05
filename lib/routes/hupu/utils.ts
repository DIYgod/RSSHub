import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export function getEntryDetails(item: DataItem): Promise<DataItem> {
    if (!item.link) {
        return Promise.resolve(item);
    }
    return cache.tryGet(item.link!, async () => {
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
    });
}
