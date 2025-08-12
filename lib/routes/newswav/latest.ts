import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/newswav',
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
            source: ['newswav.com/latest', 'newswav.com'],
        },
    ],
    name: 'Latest',
    maintainers: ['TonyRL'],
    handler,
};

async function handler() {
    const baseUrl = 'https://newswav.com';

    const response = await ofetch(`https://feed-api.newswav.com/api/web/feeds/latest`, {
        query: {
            languages: 'en,ms,zh',
        },
    });

    const list = response.data.content
        .filter((i) => i.contentId !== 'AD')
        .map((i) => ({
            title: i.title,
            description: i.description,
            category: i.topics.map((topic) => topic.en),
            link: `${baseUrl}/article/${i.permalink}`,
            permalink: i.permalink,
            pubDate: parseDate(i.publishedAt),
            author: i.publisher.name,
            image: i.thumbnailUrl,
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(`https://api.newswav.com/v4/api/v1/web/contents/${item.permalink}`);

                if (response.contentType === 'video') {
                    const video = response.meta.video;
                    item.description = `<video controls preload="metadata" poster="${video.thumbnailUrl}"><source src="${video.videoUrl}" type="${video.mimeType}"></video><br>${video.content}`;

                    return item;
                } else if (response.contentType === 'podcast') {
                    const podcast = response.meta.podcast;
                    item.description = `<audio controls"><source src="${podcast.url}" type="audio/mpeg"></audio><br>${podcast.content}`;
                    item.enclosure_type = 'audio/mpeg';

                    return item;
                }

                const article = response.meta.article;
                const $ = load(article.content);

                $('*')
                    .contents()
                    .filter((_, element) => element.type === 'comment' && element.data.trim() === 'AD')
                    .remove();

                $('iframe').each((_, element) => {
                    const $element = $(element);
                    if ($element.attr('src')?.includes('ga4-track.html') || $element.attr('src')?.includes('ga4-v2-track.html')) {
                        $element.remove();
                    }
                });

                item.description = $.html();

                const image = new URL(article.originalUrl);
                item.image = image.pathname.startsWith('/1000x0,q50=/') ? image.pathname.replace('/1000x0,q50=/', '') : image.pathname;

                return item;
            })
        )
    );

    return {
        title: 'Newswav - Malaysia’s #1 Content Aggregator | Malaysia Breaking News, World News, and Latest News',
        description: 'Latest news, videos and podcasts on Politics, Lifestyle, Sports, Current Affairs, Business & Finance, Entertainment and more from Malaysia & around the world.',
        link: `${baseUrl}/latest`,
        item: items,
    };
}
