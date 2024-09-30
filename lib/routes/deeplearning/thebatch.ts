import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/thebatch',
    categories: ['programming'],
    example: '/deeplearning/thebatch',
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
            source: ['www.deeplearning.ai/thebatch', 'www.deeplearning.ai/'],
        },
    ],
    name: 'TheBatch 周报',
    maintainers: ['nczitzk', 'juvenn'],
    handler,
    url: 'www.deeplearning.ai/thebatch',
};

async function handler() {
    const baseUrl = 'https://www.deeplearning.ai';
    const link = `${baseUrl}/the-batch/`;
    const page = await ofetch(link);
    const $ = cheerio.load(page);
    const nextJs = $('script#__NEXT_DATA__').text();
    const nextBuildId = JSON.parse(nextJs).buildId;

    const listing = await ofetch(`${baseUrl}/_next/data/${nextBuildId}/the-batch.json`);

    const items = listing.pageProps.posts.map((item) => ({
        title: item.title,
        link: `${link}${item.slug}`,
        jsonUrl: `${baseUrl}/_next/data/${nextBuildId}/the-batch/${item.slug}.json`,
        pubDate: parseDate(item.published_at),
    }));

    return {
        title: 'The Batch - a new weekly newsletter from deeplearning.ai',
        link,
        item: await Promise.all(
            items.map((item) =>
                cache.tryGet(item.link, async () => {
                    const resp = await ofetch(item.jsonUrl);
                    const $ = cheerio.load(resp.pageProps.cmsData.post.html);

                    $('a').each((_, ele) => {
                        if (ele.attribs.href?.includes('utm_campaign')) {
                            const url = new URL(ele.attribs.href);
                            url.searchParams.delete('utm_campaign');
                            url.searchParams.delete('utm_source');
                            url.searchParams.delete('utm_medium');
                            url.searchParams.delete('_hsenc');
                            ele.attribs.href = url.href;
                        }
                    });

                    item.description = $.html();
                    return item;
                })
            )
        ),
    };
}
