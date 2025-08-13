import { load } from 'cheerio';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    name: 'Latest Posts',
    maintainers: ['a322655'],
    handler,
    example: '/3quarksdaily',
    parameters: {},
    description: 'Latest posts from 3 Quarks Daily',
    categories: ['blog', 'reading'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['3quarksdaily.com/'],
            target: '',
        },
    ],
};

async function handler(): Promise<Data> {
    const baseUrl = 'https://3quarksdaily.com';

    const response = await ofetch(baseUrl);
    const $ = load(response);

    // Extract article links and basic info from homepage
    const articleElements = $('article').slice(0, 10); // Limit to first 10 posts

    const items: DataItem[] = await Promise.all(
        articleElements.toArray().map(async (element) => {
            const $element = $(element);

            // Extract basic info from homepage
            const titleElement = $element.find('h2 a, h1 a').first();
            const title = titleElement.text().trim();
            const relativeLink = titleElement.attr('href') || '';
            const link = relativeLink.startsWith('http') ? relativeLink : `${baseUrl}${relativeLink}`;

            // Get date - prefer updated date since website sorts by update time
            const updatedElement = $element.find('.updated, time.updated').first();
            const publishedElement = $element.find('.entry-date.published, .published, time.entry-date').first();

            // Use updated date if available, fallback to published date
            const timeElement = updatedElement.length > 0 ? updatedElement : publishedElement;
            const dateStr = timeElement.attr('datetime') || timeElement.text().trim();

            // Get author
            const authorElement = $element.find('.author, .entry-author, .by-author');
            const author = authorElement.text().trim();

            // Get excerpt from homepage if available
            const excerptElement = $element.find('.entry-summary, .excerpt, p').first();
            const excerpt = excerptElement.html() || '';

            // Fetch full article content
            return await cache.tryGet(link, async () => {
                try {
                    const articleResponse = await ofetch(link);
                    const $article = load(articleResponse);

                    // Extract full content
                    let description = $article('.entry-content, .post-content, .content, main article').html();

                    // Fallback to excerpt if full content not found
                    if (!description || description.trim().length < 100) {
                        description = excerpt;
                    }

                    // Clean up and fix relative URLs in content
                    if (description) {
                        const $desc = load(description);
                        $desc('img').each((_, img) => {
                            const src = $desc(img).attr('src');
                            if (src?.startsWith('/')) {
                                $desc(img).attr('src', `${baseUrl}${src}`);
                            }
                        });
                        $desc('a').each((_, anchor) => {
                            const href = $desc(anchor).attr('href');
                            if (href?.startsWith('/')) {
                                $desc(anchor).attr('href', `${baseUrl}${href}`);
                            }
                        });
                        description = $desc.html() || description;
                    }

                    return {
                        title: title || 'Untitled',
                        link,
                        description: description || excerpt || '',
                        pubDate: timezone(parseDate(dateStr), -4),
                        author: author || undefined,
                    };
                } catch {
                    // Fallback if individual article fetch fails
                    return {
                        title: title || 'Untitled',
                        link,
                        description: excerpt,
                        pubDate: timezone(parseDate(dateStr), -4),
                        author: author || undefined,
                    };
                }
            });
        })
    );

    return {
        title: '3 Quarks Daily',
        link: baseUrl,
        description: 'Latest posts from 3 Quarks Daily - A daily digest of challenging ideas from the realms of science, arts and literature.',
        item: items.filter((item) => item.title !== 'Untitled'), // Filter out failed extractions
        language: 'en-us',
        image: `${baseUrl}/favicon.ico`,
    };
}
