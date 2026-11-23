import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/blog/:language?',
    categories: ['new-media'],
    example: '/sensortower/blog',
    parameters: { language: 'Language, see below, English by default' },
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
            source: ['sensortower.com/blog', 'sensortower.com/'],
            target: '/blog',
        },
        {
            source: ['sensortower.com/zh-CN/blog'],
            target: '/blog/zh-CN',
        },
        {
            source: ['sensortower.com/ja/blog'],
            target: '/blog/ja',
        },
        {
            source: ['sensortower.com/ko/blog'],
            target: '/blog/ko',
        },
    ],
    name: 'Blog',
    maintainers: ['nczitzk'],
    handler,
    url: 'sensortower.com/blog',
    description: `| English | Chinese | Japanese | Korean |
| ------- | ------- | -------- | ------ |
|         | zh-CN   | ja       | ko     |`,
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? '';

    const rootUrl = 'https://sensortower.com';
    const currentUrl = `${rootUrl}${language ? `/${language}` : ''}/blog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const data = JSON.parse(response.data.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/)[1]).props.pageProps.pageData.page;
    const list: Array<{ link: string }> = data.contents.flatMap((content) => content.collection.itemsConnection.items.map((item) => ({ link: new URL(item.link.href, currentUrl).href })));

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);
                const detail = JSON.parse(content('#__NEXT_DATA__').text()).props.pageProps.pageData.page;

                const image = new URL(detail.featuredMedia.file.url, item.link).href;

                return {
                    ...item,
                    image,
                    title: detail.title,
                    author: detail.author.name,
                    pubDate: parseDate(detail.pubDateIso),
                    category: [...(detail.tags?.map((tag) => tag.title) ?? []), ...detail.category.map((category) => category.title)],
                    description: renderDescription({
                        image,
                        description: content('main [data-testid="Text-root"]').html() ?? undefined,
                    }),
                };
            }),
        { concurrency: 3 }
    );

    return {
        title: 'Sensor Tower - Blog',
        link: currentUrl,
        item: items,
        language: language || 'en-US',
    };
}
