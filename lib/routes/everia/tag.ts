import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/tag/:tag',
    categories: ['picture'],
    example: '/everia/tag/hinatazaka46-日向坂46',
    parameters: {
        tag: 'Tag of the image stream',
    },
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
            source: ['everia.club/tag/:tag'],
            target: '/tag/:tag',
        },
    ],
    name: 'Images with tag',
    maintainers: ['KTachibanaM'],
    handler,
};

async function handler(ctx) {
    const { tag } = ctx.req.param();
    const orignialLink = `https://everia.club/tag/${tag}`;

    const data = await ofetch(orignialLink);
    const $ = load(data);

    const list = $('article.blog-entry')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.find('h2').text();
            const link = $item.find('a').attr('href') as string;

            return {
                title,
                link,
                description: '',
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                item.description = $('.wp-block-image')
                    .toArray()
                    .map((element) => $.html(element))
                    .join('');

                return item;
            })
        )
    );

    return {
        title: `${tag} - EVERIA.CLUB`,
        link: orignialLink,
        item: items,
    };
}
