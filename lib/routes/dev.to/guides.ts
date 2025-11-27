import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/guides',
    categories: ['programming'],
    example: '/dev.to/guides',
    parameters: {},
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
            source: ['dev.to/'],
        },
    ],
    name: 'Trending Guides',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'dev.to',
};

async function handler() {
    const baseUrl = 'https://dev.to';
    const response = await got(baseUrl);
    const $ = load(response.data);

    // Get all guide links from the widget-link-list
    const guideLinks = $('.widget-link-list .crayons-link--contentful')
        .toArray()
        .map((element) => {
            const $element = $(element);
            return {
                title: $element.text().trim(),
                link: baseUrl + $element.attr('href'),
            };
        });

    // Fetch content for each guide
    const items = await Promise.all(
        guideLinks.map((item) =>
            cache.tryGet(item.link, async () => {
                const articleResponse = await got(item.link);
                const $article = load(articleResponse.data);

                // Extract article cover image
                const coverImage = $article('.crayons-article__cover img').attr('src');

                // Extract article content
                const content = $article('.crayons-article__body').html() || '';

                // Extract author info
                const authorName = $article('.crayons-article__header__meta .fw-bold').first().text().trim();
                const authorUrl = $article('.crayons-article__header__meta .fw-bold').first().attr('href');
                const authorAvatar = $article('.crayons-article__header__meta .radius-full').attr('src');
                // Extract publication date
                const dateElement = $article('time[datetime]').first();
                const dateString = dateElement.attr('datetime') || undefined;
                const pubDate = dateString ? parseDate(dateString) : undefined;
                // Extract tags
                const tags = $article('.spec__tags .crayons-tag')
                    .toArray()
                    .map((tag) => $(tag).text().trim().replace('#', ''));

                return {
                    title: item.title,
                    link: item.link,
                    description: content,
                    image: coverImage,
                    pubDate,
                    category: tags,
                    author: [
                        {
                            name: authorName,
                            url: authorUrl ? baseUrl + authorUrl : undefined,
                            avatar: authorAvatar,
                        },
                    ],
                } as DataItem;
            })
        )
    );

    return {
        title: 'DEV.to - Trending Guides',
        link: baseUrl,
        description: 'Trending guides and resources from DEV.to',
        language: 'en-us',
        item: items,
        icon: 'https://media2.dev.to/dynamic/image/width=32,height=,fit=scale-down,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F8j7kvp660rqzt99zui8e.png',
    } as Data;
}
