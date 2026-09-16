import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/music/latest',
    categories: ['new-media'],
    example: '/okayafrica/music/latest',
    name: 'Music Latest',
    maintainers: ['ashi-koki'],
    handler,
};

async function handler(): Promise<Data> {
    const rootUrl = 'https://www.okayafrica.com';
    const listUrl = `${rootUrl}/music/latest`;

    const listResponse = await ofetch(listUrl);
    const $ = load(listResponse);

    const items = await Promise.all(
        $('article a[itemprop="url"]')
            .toArray()
            .map((el) => {
                const link = $(el).attr('href')!;
                const title = $(el).closest('article').find('h2[itemprop="headline"]').text().trim();

                return cache.tryGet(link, async () => {
                    const pageResponse = await ofetch(link);
                    const $page = load(pageResponse);

                    $page('.bodytext .google-ad, .bodytext .articlesByTag').remove();

                    const pubDate = $page('.dateGroup.datePublished time').attr('datetime');

                    return {
                        title: $page('h1.headline').text().trim() || title,
                        link,
                        pubDate: pubDate ? parseDate(pubDate) : undefined,
                        author: $page('.lab-hidden-byline-name').first().text().trim(),
                        description: $page('.bodytext').html() ?? undefined,
                        image: $page('meta[property="og:image"]').attr('content'),
                    };
                });
            })
    );

    return {
        title: 'OkayAfrica Music',
        link: listUrl,
        description: 'Latest music articles from OkayAfrica',
        language: 'en',
        item: items as DataItem[],
    };
}
