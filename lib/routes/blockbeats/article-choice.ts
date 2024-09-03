import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/article-choice',
    categories: ['new-media'],
    example: '/blockbeats/article-choice',
    name: '文章精选',
    maintainers: ['DIYgod'],
    handler,
    radar: [
        {
            source: ['www.theblockbeats.info/article_choice'],
            target: '/article-choice',
        },
    ],
};

async function handler() {
    const response = await got('https://www.theblockbeats.info/article_choice');

    const $ = load(response.data);

    const items = await Promise.all(
        $('.article-item')
            .toArray()
            .map(async (item) => {
                const $item = $(item);
                const pubDate = new Date($item.find('.item-time').text()).toUTCString();
                let link = $item.find('.article-item-title').attr('href');
                const category = $item
                    .find('.item-label')
                    .toArray()
                    .map((tag) => $(tag).text().replaceAll(/^#/g, ''));
                const author = $item.find('.article-item-author-name').text();
                const title = $item.find('.article-item-title').text();
                let description = '';
                if (link) {
                    link = `https://www.theblockbeats.info${link}`;
                    description = (await cache.tryGet(link, async () => {
                        const detailResponse = await got(link);
                        const content = load(detailResponse.data);
                        return content('.news-content').html() || '';
                    })) as string;
                }
                return {
                    title,
                    pubDate,
                    link,
                    category,
                    author,
                    description,
                };
            })
    );

    return {
        title: 'BlockBeats - 文章精选',
        link: 'https://www.theblockbeats.info/article_choice',
        item: items,
    };
}
