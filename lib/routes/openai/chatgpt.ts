import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDateStrict } from '@/utils/time';

export const route: Route = {
    path: '/chatgpt/release-notes',
    categories: ['program-update'],
    example: '/openai/chatgpt/release-notes',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'ChatGPT - Release Notes',
    maintainers: ['xbot'],
    handler,
};

async function handler() {
    const articleUrl = 'https://help.openai.com/en/articles/6825453-chatgpt-release-notes';

    const cacheIn = await cache.tryGet(
        `openai:chatgpt:release-notes:v4:${articleUrl}`,
        async () => {
            const response = await ofetch(articleUrl, { allowH2: false });

            const $ = load(response);
            const articleContent = $('.article-content');

            if (articleContent.length === 0) {
                throw new Error('Failed to find article content.');
            }

            const feedTitle = $('h1').first().text();
            const feedDesc = 'ChatGPT Release Notes';

            const items = $('h1', articleContent)
                .toArray()
                .map((element): DataItem => {
                    const $h1 = $(element);
                    const text = $h1.text().trim();

                    const dateMatch = text.match(/(\w+\s+\d+(?:st|nd|rd|th)?,?\s+\d{4})/i);
                    let pubDate: Temporal.Instant | undefined;
                    if (dateMatch) {
                        const dateStr = dateMatch[1].replaceAll(/(\d)(st|nd|rd|th)\b/gi, '$1').replace(/,\s*/, ' ');
                        pubDate = parseDateStrict(dateStr, ['MMMM D YYYY', 'MMM D YYYY'], 0);
                    }

                    const $nextSiblings = $h1.nextUntil('h1');
                    const $firstH2 = $nextSiblings.filter('h2').first();
                    const firstH2Text = $firstH2.text().trim();

                    const title = firstH2Text || text;

                    const content = $nextSiblings
                        .not($firstH2)
                        .toArray()
                        .map((el) => $(el).prop('outerHTML'))
                        .join('');
                    const description = content;

                    return {
                        guid: `${articleUrl}#${pubDate ? pubDate.epochMilliseconds : text}`,
                        title,
                        link: articleUrl,
                        pubDate,
                        description,
                    };
                });

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
