import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

export const route: Route = {
    path: '/news/:type?',
    categories: ['travel'],
    example: '/capitalmuseum/news/notice',
    parameters: {
        type: 'News type, supported values: news（新闻资讯）, notice（通知公告）. Default: All news.',
    },
    name: 'News',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.capitalmuseum.org.cn/news'],
            target: '/news',
        },
    ],

    handler: async (ctx) => {
        const typeParam = ctx.req.param('type') || 'all';

        const typeMap: Record<string, string> = {
            notice: '通知公告',
            news: '新闻资讯',
        };

        const targetType = typeMap[typeParam];

        const baseUrl = 'https://www.capitalmuseum.org.cn';
        const apiUrl = `${baseUrl}/news`;
        const museumName = namespace.zh?.name || namespace.name;

        const response = await got({
            method: 'get',
            url: apiUrl,
        });

        const $ = load(response.data);
        const nuxtDataStr = $('#__NUXT_DATA__').text() || '{}'; // use __NUXT_DATA__ to get the data structure of the page
        const nuxtData = JSON.parse(nuxtDataStr);
        // get all the links of the news items by section name
        const getLinksBySection = (sectionName: string) => {
            // get the span element that contains the section name
            const $titleSpan = $(`span:contains("${sectionName}")`);

            // for example, div class="oz09n6" is the container of the news items, which is the next sibling of the span element
            const $container = $titleSpan.parent().nextAll('div').first();

            // get all the links of the news items in the container
            return $container
                .find('a[href^="/news/"]')
                .toArray()
                .map((el) => $(el).attr('href') as string);
        };

        let targetHrefs: string[] = [];

        if (targetType) {
            targetHrefs = getLinksBySection(targetType);
        } else if (typeParam === 'all') {
            targetHrefs = Object.values(typeMap).flatMap((sectionName) => getLinksBySection(sectionName));
        }

        // match the newsId in the href with the newsId in the nuxtData to get the title and publishtime
        const items = targetHrefs.map((href) => {
            const newsId = href.split('/').pop();
            const link = `${baseUrl}${href}`;

            const newsObj = nuxtData.find((item: any) => nuxtData[item.newsid] === newsId);

            const pubTime = nuxtData[newsObj.publishtime];
            const pubDate = timezone(parseDate(pubTime, 'YYYY-MM-DD'), 8);
            const title = nuxtData[newsObj.title];

            return {
                title,
                link,
                pubDate,
            } as DataItem;
        });

        return {
            title: `${museumName} - 首博快讯${targetType ? ` - ${targetType}` : ''}`,
            link: apiUrl,
            language: 'zh-CN',
            item: items,
        };
    },
};
