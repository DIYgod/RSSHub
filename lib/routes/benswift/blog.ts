import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://benswift.me';
const currentUrl = `${rootUrl}/blog/`;

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/benswift/blog',
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
            source: ['benswift.me/blog', 'benswift.me/blog/', 'benswift.me/blog/:year/:month/:day/:slug/'],
            target: '/benswift/blog',
        },
    ],
    name: 'Blog',
    maintainers: ['wangdepin'],
    handler,
    url: 'benswift.me/blog/',
    description: 'Posts from Ben Swift’s blog.',
};

async function handler() {
    const response = await got(currentUrl);
    const $ = load(response.data);

    const items = await Promise.all(
        $('li.post-item')
            .toArray()
            .map((item) => {
                const element = $(item);
                const title = element.find('a.post-item-title').text().trim();
                const href = element.find('a.post-item-title').attr('href');
                const link = href ? new URL(href, rootUrl).href : currentUrl;
                const excerpt = element.find('.post-item-excerpt').text().trim();
                const pubDateText = element.find('.post-item-date').text().trim();
                const category = element
                    .find('.tag')
                    .toArray()
                    .map((tag) => $(tag).text().trim())
                    .filter(Boolean);

                return cache.tryGet(link, async () => {
                    const detailResponse = await got(link);
                    const detail = load(detailResponse.data);

                    const main = detail('main').first().clone();
                    main.find('h1.page-title, p.post-date, p.tag-container, details.cite-post, footer.site-footer, script').remove();

                    const metaAuthor = detail('meta[name="citation_author"]').attr('content') ?? detail('meta[name="author"]').attr('content');
                    const metaPubDate = detail('meta[name="citation_date"]').attr('content');

                    return {
                        title,
                        link,
                        description: main.html() || excerpt,
                        author: metaAuthor,
                        pubDate: parseDate(metaPubDate ?? pubDateText),
                        category,
                    };
                });
            })
    );

    return {
        title: 'Blog | benswift.me',
        link: currentUrl,
        item: items,
    };
}
