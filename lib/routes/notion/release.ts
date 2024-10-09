import type { DataItem, Route } from '@/types';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import day from 'dayjs';

const handler: Route['handler'] = async () => {
    const data = await ofetch('https://notion.so/releases', {
        headers: {
            'Accept-Language': 'en-US', // TODO accept param
        },
    });

    const $ = load(data);

    // the first post, do not cache
    const title = $('h2').first().text() ?? '';
    const pubDate = parseDate($('time').first().text());
    const description = $('article.release article').first().html() ?? '';
    const link = `https://notion.so/releases/${day(pubDate).format('YYYY-MM-DD')}`;

    // archive
    const item = (await Promise.all(
        $('div[class^="releasePreviewsSection"] h3 a[href^="/releases/"]')
            .toArray()
            .slice(0, 5)
            .map((item) => {
                const link = `https://notion.so${item.attribs.href}`;

                return cache.tryGet(`notion:release:${link}`, async () => {
                    const data = await ofetch(link, {
                        headers: {
                            'Accept-Language': 'en-US', // Notion will adjust returned content based on this header
                        },
                    });

                    const $ = load(data);

                    return {
                        title: $('h2').first().text() ?? '',
                        pubDate: parseDate($('time').first().text()),
                        description: $('article.release article').first().html() ?? '',
                        link,
                    };
                });
            })
    )) as DataItem[];

    return {
        title: 'Notion Releases',
        link: 'https://notion.so/releases',
        item: [
            {
                title,
                description,
                pubDate,
                link,
            },
            ...item,
        ],
    };
};

export const route: Route = {
    name: 'Release',
    path: '/release',
    url: 'notion.so/releases',
    example: '/notion/release',
    categories: ['program-update'],
    maintainers: ['equt'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    handler,
};
