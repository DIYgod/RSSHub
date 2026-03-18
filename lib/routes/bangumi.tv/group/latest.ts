import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://bangumi.tv';

type ListItem = {
    title: string;
    link: string;
    author?: string;
    pubDate?: Date;
    category?: string[];
};

export const route: Route = {
    path: '/group/latest',
    categories: ['anime'],
    example: '/bangumi.tv/group/latest',
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
            source: ['bangumi.tv/group'],
            target: '/group/latest',
        },
        {
            source: ['bgm.tv/group'],
            target: '/group/latest',
        },
    ],
    name: '所有小组最新话题',
    maintainers: ['ZHA30'],
    handler,
};

async function handler() {
    const listUrl = `${baseUrl}/group`;
    const response = await ofetch(listUrl);
    const $ = load(response);

    const list: ListItem[] = $('.topic_list tr')
        .toArray()
        .flatMap((row) => {
            const element = $(row);
            const titleLink = element.find('td').first().find('a.l');
            const link = titleLink.attr('href');
            const title = titleLink.text();
            if (!link || !title) {
                return [];
            }

            const groupName = element.find('td').eq(1).find('a').text();
            const author = element.find('td').eq(2).find('a').text();
            const timeText = element.find('td').last().find('small').text();

            return [
                {
                    title,
                    link: new URL(link, baseUrl).href,
                    author: author || undefined,
                    pubDate: timeText ? parseDate(timeText) : undefined,
                    category: groupName ? [groupName] : undefined,
                },
            ];
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const content = load(detailResponse);
                const description = content('.postTopic .topic_content').html() || undefined;

                return {
                    ...item,
                    description,
                };
            })
        )
    );

    return {
        title: 'Bangumi 所有小组最新话题',
        link: listUrl,
        item: items,
    };
}
