import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseItems } from './utils';

export const route: Route = {
    path: '/tag/:tag',
    categories: ['multimedia'],
    example: '/sfmcompile/tag/pov',
    parameters: { tag: 'The tag' },
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
            source: ['sfmcompile.club/tag/:tag/'],
            target: '/tag/:tag',
        },
    ],
    name: 'Tag',
    maintainers: ['vector0902'],

    handler: async (ctx) => {
        const { tag = 'pov' } = ctx.req.param();

        const url = `https://sfmcompile.club/tag/${tag}/`;
        // url = 'http://localhost:8000/tag1.html'; # local test
        const response = await ofetch(url);
        const $ = load(response);

        const items = $('.g1-collection-item')
            .toArray()
            .map((item) => parseItems($(item)));

        return {
            // channel title
            title: `SFMCompile.club tag ${tag}`,
            // channel link
            link: url,
            // each feed item
            item: items,
        };
    },
};
