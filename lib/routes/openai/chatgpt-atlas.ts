import { load } from 'cheerio';
import dayjs from 'dayjs';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/chatgpt-atlas/release-notes',
    categories: ['program-update'],
    example: '/openai/chatgpt-atlas/release-notes',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'ChatGPT Atlas - Release Notes',
    maintainers: ['xbot'],
    handler,
};

async function handler() {
    const articleUrl = 'https://help.openai.com/en/articles/12591856-chatgpt-atlas-release-notes';

    const cacheIn = await cache.tryGet(
        articleUrl,
        async () => {
            const response = await ofetch(articleUrl);
            const $ = load(response);
            const articleContent = $('.article-content');

            if (articleContent.length === 0) {
                throw new Error('Failed to find article content.');
            }

            const feedTitle = $('h1').first().text();
            const feedDesc = 'ChatGPT Atlas Release Notes';

            const items = $('h1', articleContent)
                .toArray()
                .map((element) => {
                    const $h1 = $(element);
                    const text = $h1.text().trim();

                    const dateMatch = text.match(/(\w+\s+\d+[stndrh]*,\s+\d{4})/i);
                    let pubDate: Date | undefined;
                    if (dateMatch) {
                        const dateStr = dateMatch[1];
                        const parsedDate = dayjs(dateStr, ['MMMM Do, YYYY', 'MMMM D, YYYY'], 'en');
                        if (parsedDate.isValid()) {
                            pubDate = parsedDate.toDate();
                        }
                    }

                    const content = $h1
                        .nextUntil('h1')
                        .toArray()
                        .map((el) => $(el).prop('outerHTML'))
                        .join('');
                    const description = content;

                    return {
                        guid: `${articleUrl}#${pubDate ? pubDate.getTime() : text}`,
                        title: text,
                        link: articleUrl,
                        pubDate,
                        description,
                    };
                }) as DataItem[];

            return { feedTitle, feedDesc, items };
        },
        config.cache.routeExpire,
        false
    );

    return {
        title: cacheIn.feedTitle,
        description: cacheIn.feedDesc,
        link: articleUrl,
        item: cacheIn.items,
    };
}
