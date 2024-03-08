import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import asyncPool from 'tiny-async-pool';

export const route: Route = {
    path: '/realtime/:category?',
    categories: ['traditional-media'],
    example: '/nextapple/realtime/latest',
    parameters: { category: '類別，見下表，默認為首頁' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['tw.nextapple.com/', 'tw.nextapple.com/realtime/:category'],
    },
    name: '最新新聞',
    maintainers: ['miles170'],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'latest';
    const currentUrl = `https://tw.nextapple.com/realtime/${category}`;
    const response = await got(currentUrl);
    const $ = load(response.data);
    const items = [];
    for await (const item of asyncPool(5, $('article.infScroll'), (item) => {
        const link = $(item).find('.post-title').attr('href');
        return cache.tryGet(link, async () => {
            const response = await got(link);
            const $ = load(response.data);
            const mainContent = $('#main-content');
            const titleElement = mainContent.find('header h1');
            const title = titleElement.text();
            titleElement.remove();
            const postMetaElement = mainContent.find('.post-meta');
            const category = postMetaElement.find('.category').text();
            const pubDate = parseDate(postMetaElement.find('time').attr('datetime'));
            postMetaElement.remove();
            $('.post-comments').remove();

            return {
                title,
                description: mainContent.html(),
                category,
                pubDate,
                link,
            };
        });
    })) {
        items.push(item);
    }

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
