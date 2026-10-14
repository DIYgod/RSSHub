import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/blog',
    categories: ['new-media'],
    example: '/deepmind/blog',
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
            source: ['deepmind.google/blog', 'deepmind.google/blog/:slug', 'deepmind.google/'],
        },
        {
            source: ['deepmind.com/blog', 'deepmind.com/'],
        },
    ],
    name: 'Blog',
    maintainers: ['nczitzk', 'TonyRL'],
    handler,
    url: 'deepmind.google/blog',
};

async function handler() {
    const feed = await parser.parseURL('https://www.deepmind.com/blog/rss.xml');
    const entries = [...feed.items];
    const selected = entries;

    const items = await pMap(
        selected,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const { data } = await got(item.link);
                const $ = load(data);

                const content = $('.article-container__content, #page-content').first();
                content.append($('uni-footnotes').html() ?? '');
                content.find('.section-cover, section:has(.news-group-section), .uni-blog-article-tags, script, style').remove();
                content.find('video[poster]').each((_, video) => {
                    const $video = $(video);
                    $video.attr('poster', new URL($video.attr('poster')!, item.link).href);
                });
                content.find('video source[data-src]').each((_, source) => {
                    const $source = $(source);
                    $source.attr('src', $source.attr('data-src')!);
                    $source.removeAttr('data-src');
                });
                item.description = content.html() || $('.e_container .c_rich-text__cms').html();

                delete item.content;
                delete item.contentSnippet;
                delete item.isoDate;
                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: feed.title!,
        description: feed.description,
        image: 'https://assets-global.website-files.com/621d30e84caf0be3291dbf1c/621d336835a91420c6a8dcf2_webclip.png',
        link: feed.link!,
        item: items as DataItem[],
        language: 'en' as const,
    };
}
