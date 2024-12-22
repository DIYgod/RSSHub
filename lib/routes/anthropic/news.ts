import got from '@/utils/got';
import { load } from 'cheerio';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/news',
    categories: ['programming'],
    example: '/anthropic/news',
    parameters: {},
    radar: [
        {
            source: ['anthropic.com'],
        },
    ],
    name: 'News',
    maintainers: ['etShaw-zh'],
    handler,
    url: 'anthropic.com/news',
};

async function handler() {
    const link = 'https://anthropic.com/news';
    const response = await got(link);
    const $ = load(response.body);

    const list = $('.contentFadeUp a')
        .toArray()
        .map((e) => {
            e = $(e);
            const title = e.find('h3.PostCard_post-heading__KPsva').text().trim(); // Extract title
            const href = e.attr('href'); // Extract link
            const pubDate = e.find('.PostList_post-date__giqsu').text().trim(); // Extract publication date
            const fullLink = href.startsWith('http') ? href : `https://anthropic.com${href}`; // Complete relative links
            return {
                title,
                link: fullLink,
                pubDate,
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.body);

                item.description = $('.text-b2.PostDetail_post-detail__uTcjp').html() || ''; // Full article content

                return item;
            })
        )
    );

    return {
        title: 'Anthropic News',
        link,
        description: 'Latest news from Anthropic',
        item: out,
    };
}
