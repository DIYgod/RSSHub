import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/tag/:tag?',
    categories: ['multimedia'],
    example: '/bandcamp/tag/united-kingdom',
    parameters: { tag: 'Tag, can be found in URL' },
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
            source: ['bandcamp.com/tag/:tag'],
            target: '/tag/:tag',
        },
    ],
    name: 'Tag',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const tag = ctx.req.param('tag');

    const rootUrl = 'https://bandcamp.com';
    const currentUrl = `${rootUrl}/tag/${tag}?tab=all_releases`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = response.data
        .match(/tralbum_url&quot;:&quot;(.*?)&quot;,&quot;audio_url/g)
        .slice(0, 10)
        .map((item) => ({
            link: item.match(/tralbum_url&quot;:&quot;(.*?)&quot;,&quot;audio_url/)[1].split('&quot;')[0],
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                item.title = content('.trackTitle').eq(0).text();
                item.author = content('h3 span a').text();
                item.description = content('#tralbumArt').html() + content('#trackInfo').html();

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
